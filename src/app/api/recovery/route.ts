import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { isControlAuthorized } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { RECOVERY_RULES, SERVICE_REGISTRY, SERVICE_NAME_REGEX } from '@/lib/constants';
import type { NextRequest } from 'next/server';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

// Track retry counts in memory (resets on server restart)
const retryCounts: Record<string, number> = {};

// In-memory lock to prevent concurrent recovery runs creating duplicate incidents
let recoveryInProgress = false;

// --- DB helper functions (best-effort, never block recovery) ---

async function findOpenIncident(supabase: ReturnType<typeof getSupabaseAdmin>, serviceName: string) {
  try {
    const { data } = await supabase
      .from('mc_incidents')
      .select('*')
      .contains('services_affected', [serviceName])
      .in('status', ['open', 'investigating'])
      .eq('source', 'auto-recovery')
      .order('detected_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

async function createAutoIncident(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  serviceName: string,
  severity: 'critical' | 'high' | 'medium' | 'low',
  action: string,
) {
  try {
    await supabase.from('mc_incidents').insert({
      title: `${serviceName} auto-recovery triggered`,
      description: `Service ${serviceName} detected as errored. Auto-recovery action: ${action}`,
      severity,
      status: 'open',
      services_affected: [serviceName],
      detected_at: new Date().toISOString(),
      source: 'auto-recovery',
      action_taken: action,
      retry_count: 1,
    });
  } catch {
    // best-effort
  }
}

async function resolveAutoIncident(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  incidentId: number,
  detectedAt: string,
) {
  try {
    const now = new Date();
    const duration = now.getTime() - new Date(detectedAt).getTime();
    await supabase
      .from('mc_incidents')
      .update({
        status: 'resolved',
        resolved_at: now.toISOString(),
        recovery_duration_ms: duration,
        updated_at: now.toISOString(),
      })
      .eq('id', incidentId);
  } catch {
    // best-effort
  }
}

// POST — Run auto-recovery check
export async function POST(request: NextRequest) {
  if (!isControlAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (process.env.VERCEL) {
    return NextResponse.json({ error: 'Recovery is localhost-only' }, { status: 400 });
  }

  // Prevent concurrent recovery runs (race condition → duplicate incidents)
  if (recoveryInProgress) {
    return NextResponse.json({ skipped: true, reason: 'recovery already in progress' });
  }
  recoveryInProgress = true;

  let supabase: ReturnType<typeof getSupabaseAdmin> | null = null;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    // DB not available — continue with recovery without logging
  }

  try {
    const { stdout } = await execAsync('pm2 jlist', { timeout: 10000 });
    const parsed: unknown = JSON.parse(stdout);
    const processes: Array<{ name: string; pm2_env?: { status?: string } }> = Array.isArray(parsed) ? parsed : [];

    const actions: Array<{ service: string; action: string; result: string }> = [];

    for (const rule of RECOVERY_RULES) {
      if (!rule.enabled) continue;

      const svc = SERVICE_REGISTRY.find((s) => s.name === rule.service);
      if (!svc || !SERVICE_NAME_REGEX.test(rule.service)) continue;

      if (svc.runtime === 'wsl-systemd') {
        // WSL service check
        try {
          const { stdout: status } = await execAsync(
            `wsl bash -c "systemctl --user is-active ${rule.service}"`,
            { timeout: 5000 }
          );
          const trimmed = status.trim();
          if (trimmed === rule.condition || (rule.condition === 'errored' && trimmed === 'failed')) {
            const retryKey = rule.id;
            const currentCount = (retryCounts[retryKey] || 0) + 1;
            retryCounts[retryKey] = currentCount;

            if (currentCount > rule.maxRetries) {
              // Stop incrementing past maxRetries+1
              retryCounts[retryKey] = rule.maxRetries + 1;
              actions.push({ service: rule.service, action: 'skip', result: `max retries (${rule.maxRetries}) exceeded` });

              // Telegram alert (WSL services too)
              if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ALERT_CHAT_ID) {
                const text = `[Auto-Recovery] ${rule.service} (WSL) recovery failed after ${rule.maxRetries} attempts. Manual intervention needed.`;
                await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ chat_id: process.env.TELEGRAM_ALERT_CHAT_ID, text }),
                }).catch(() => {});
              }

              // Escalate incident in DB
              if (supabase) {
                const existing = await findOpenIncident(supabase, rule.service);
                if (existing) {
                  try {
                    await supabase.from('mc_incidents').update({
                      status: 'investigating',
                      severity: 'critical',
                      retry_count: retryCounts[retryKey],
                      updated_at: new Date().toISOString(),
                    }).eq('id', existing.id);
                  } catch { /* best-effort */ }
                }
              }
              continue;
            }

            const actionDesc = `systemctl --user restart ${rule.service}`;
            await execAsync(
              `wsl bash -c "systemctl --user restart ${rule.service}"`,
              { timeout: 10000 }
            );
            actions.push({ service: rule.service, action: 'restart', result: `attempt ${retryCounts[retryKey]}/${rule.maxRetries}` });

            // Log to DB
            if (supabase) {
              const existing = await findOpenIncident(supabase, rule.service);
              if (existing) {
                try {
                  await supabase.from('mc_incidents').update({
                    retry_count: retryCounts[retryKey],
                    action_taken: actionDesc,
                    updated_at: new Date().toISOString(),
                  }).eq('id', existing.id);
                } catch { /* best-effort */ }
              } else {
                await createAutoIncident(supabase, rule.service, 'high', actionDesc);
              }
            }
          } else {
            // Service healthy — always check DB for open incidents (handles server restart case)
            if (supabase) {
              const existing = await findOpenIncident(supabase, rule.service);
              if (existing) {
                await resolveAutoIncident(supabase, existing.id, existing.detected_at);
              }
            }
            delete retryCounts[rule.id];
          }
        } catch {
          actions.push({ service: rule.service, action: 'check-failed', result: 'WSL check failed' });
        }
        continue;
      }

      // pm2 service check
      const proc = processes.find((p) => p.name === rule.service);
      const currentStatus = proc?.pm2_env?.status || 'not_registered';

      if (currentStatus === rule.condition) {
        const retryKey = rule.id;
        const currentCount = (retryCounts[retryKey] || 0) + 1;
        retryCounts[retryKey] = currentCount;

        if (currentCount > rule.maxRetries) {
          // Stop incrementing past maxRetries+1
          retryCounts[retryKey] = rule.maxRetries + 1;
          actions.push({ service: rule.service, action: 'skip', result: `max retries (${rule.maxRetries}) exceeded` });

          // Telegram alert
          if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ALERT_CHAT_ID) {
            const text = `[Auto-Recovery] ${rule.service} recovery failed after ${rule.maxRetries} attempts. Manual intervention needed.`;
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: process.env.TELEGRAM_ALERT_CHAT_ID,
                text,
              }),
            }).catch(() => {});
          }

          // Escalate incident in DB
          if (supabase) {
            const existing = await findOpenIncident(supabase, rule.service);
            if (existing) {
              try {
                await supabase.from('mc_incidents').update({
                  status: 'investigating',
                  severity: 'critical',
                  retry_count: retryCounts[retryKey],
                  updated_at: new Date().toISOString(),
                }).eq('id', existing.id);
              } catch { /* best-effort */ }
            }
          }
          continue;
        }

        const actionDesc = `pm2 restart ${rule.service}`;
        await execAsync(`pm2 restart ${rule.service}`, { timeout: 10000 });
        actions.push({ service: rule.service, action: 'restart', result: `attempt ${retryCounts[retryKey]}/${rule.maxRetries}` });

        // Log to DB
        if (supabase) {
          const existing = await findOpenIncident(supabase, rule.service);
          if (existing) {
            try {
              await supabase.from('mc_incidents').update({
                retry_count: retryCounts[retryKey],
                action_taken: actionDesc,
                updated_at: new Date().toISOString(),
              }).eq('id', existing.id);
            } catch { /* best-effort */ }
          } else {
            await createAutoIncident(supabase, rule.service, 'high', actionDesc);
          }
        }
      } else if (currentStatus === 'online') {
        // Service healthy — always check DB for open incidents (handles server restart case)
        if (supabase) {
          const existing = await findOpenIncident(supabase, rule.service);
          if (existing) {
            await resolveAutoIncident(supabase, existing.id, existing.detected_at);
          }
        }
        delete retryCounts[rule.id];
      }
    }

    return NextResponse.json({
      checked: RECOVERY_RULES.filter((r) => r.enabled).length,
      actions,
      retryCounts: { ...retryCounts },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'unknown error' },
      { status: 500 }
    );
  } finally {
    recoveryInProgress = false;
  }
}

// GET — View current rules and retry state
export async function GET() {
  return NextResponse.json({
    rules: RECOVERY_RULES,
    retryCounts: { ...retryCounts },
  });
}
