import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { isControlAuthorized } from '@/lib/auth';
import { RECOVERY_RULES, SERVICE_REGISTRY, SERVICE_NAME_REGEX } from '@/lib/constants';
import type { NextRequest } from 'next/server';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

// Track retry counts in memory (resets on server restart)
const retryCounts: Record<string, number> = {};

// POST — Run auto-recovery check
export async function POST(request: NextRequest) {
  if (!isControlAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (process.env.VERCEL) {
    return NextResponse.json({ error: 'Recovery is localhost-only' }, { status: 400 });
  }

  try {
    const { stdout } = await execAsync('pm2 jlist', { timeout: 10000 });
    const processes: Array<{ name: string; pm2_env?: { status?: string } }> = JSON.parse(stdout);

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
            retryCounts[retryKey] = (retryCounts[retryKey] || 0) + 1;

            if (retryCounts[retryKey] > rule.maxRetries) {
              actions.push({ service: rule.service, action: 'skip', result: `max retries (${rule.maxRetries}) exceeded` });
              continue;
            }

            await execAsync(
              `wsl bash -c "systemctl --user restart ${rule.service}"`,
              { timeout: 10000 }
            );
            actions.push({ service: rule.service, action: 'restart', result: `attempt ${retryCounts[retryKey]}/${rule.maxRetries}` });
          } else {
            // Service healthy, reset counter
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
        retryCounts[retryKey] = (retryCounts[retryKey] || 0) + 1;

        if (retryCounts[retryKey] > rule.maxRetries) {
          actions.push({ service: rule.service, action: 'skip', result: `max retries (${rule.maxRetries}) exceeded` });

          // Create incident if telegram is configured
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
          continue;
        }

        await execAsync(`pm2 restart ${rule.service}`, { timeout: 10000 });
        actions.push({ service: rule.service, action: 'restart', result: `attempt ${retryCounts[retryKey]}/${rule.maxRetries}` });
      } else if (currentStatus === 'online') {
        // Service healthy, reset counter
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
  }
}

// GET — View current rules and retry state
export async function GET() {
  return NextResponse.json({
    rules: RECOVERY_RULES,
    retryCounts: { ...retryCounts },
  });
}
