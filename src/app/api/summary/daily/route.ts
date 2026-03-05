import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { isControlAuthorized } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PROJECTS } from '@/lib/constants';
import type { NextRequest } from 'next/server';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

// POST — Generate and send daily summary via Telegram
export async function POST(request: NextRequest) {
  if (!isControlAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sections: string[] = [];
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    sections.push(`📊 Daily Summary — ${dateStr}`);
    sections.push('');

    // 1. Service status
    if (!process.env.VERCEL) {
      try {
        const { stdout } = await execAsync('pm2 jlist', { timeout: 10000 });
        const processes: Array<{
          name: string;
          pm2_env?: { status?: string };
        }> = JSON.parse(stdout);
        const online = processes.filter((p) => p.pm2_env?.status === 'online').length;
        const errored = processes.filter((p) => p.pm2_env?.status === 'errored');
        sections.push(`🖥 Services: ${online}/${processes.length} online`);
        if (errored.length > 0) {
          sections.push(`⚠️ Errored: ${errored.map((p) => p.name).join(', ')}`);
        }
      } catch {
        sections.push('🖥 Services: check failed');
      }
    }

    // 2. Open incidents count
    const supabase = getSupabaseAdmin();
    try {
      const { data: incidents } = await supabase
        .from('mc_incidents')
        .select('id, severity')
        .neq('status', 'resolved');
      if (incidents && incidents.length > 0) {
        sections.push(`🚨 Open Incidents: ${incidents.length}`);
      } else {
        sections.push('✅ No open incidents');
      }
    } catch {
      // table might not exist
    }

    // 3. Active agent tasks
    try {
      const { data: agentTasks } = await supabase
        .from('mc_agent_tasks')
        .select('id, phase')
        .not('phase', 'in', '("done","failed","escalated")');
      if (agentTasks && agentTasks.length > 0) {
        sections.push(`🤖 Active Agent Tasks: ${agentTasks.length}`);
      }
    } catch {
      // table might not exist
    }

    // 4. Recent git activity (last 24h commit count)
    const yesterday = new Date(now.getTime() - 86400000).toISOString();
    let totalCommits = 0;
    const activeProjects: string[] = [];

    if (process.env.GITHUB_TOKEN) {
      const headers = {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      };

      // Check a subset of important projects
      const checkProjects = PROJECTS.filter((p) =>
        ['running', 'dev', 'tool'].includes(p.category)
      ).slice(0, 10);

      for (const proj of checkProjects) {
        try {
          const res = await fetch(
            `https://api.github.com/repos/clusteruni-debug/${proj.repo}/commits?since=${yesterday}&per_page=1`,
            { headers }
          );
          if (res.ok) {
            // Check Link header for pagination to estimate count
            const commits = await res.json();
            if (Array.isArray(commits) && commits.length > 0) {
              totalCommits += commits.length;
              activeProjects.push(proj.name);
            }
          }
        } catch {
          // skip
        }
      }
    }

    if (totalCommits > 0) {
      sections.push(`📝 Commits (24h): ${totalCommits}+ in ${activeProjects.join(', ')}`);
    } else {
      sections.push('📝 No commits in last 24h');
    }

    // 5. Make Money status
    if (!process.env.VERCEL) {
      try {
        const mmRes = await fetch('http://localhost:3001/api/portfolio', { signal: AbortSignal.timeout(3000) });
        if (mmRes.ok) {
          const portfolio = await mmRes.json();
          sections.push(`💰 Balance: $${portfolio.balance?.toFixed(2) ?? '?'} | PnL: $${portfolio.totalPnL?.toFixed(2) ?? '?'}`);
        }
      } catch {
        sections.push('💰 Make Money: offline');
      }
    }

    const message = sections.join('\n');

    // Send via Telegram
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ALERT_CHAT_ID) {
      const tgRes = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_ALERT_CHAT_ID,
            text: message,
          }),
        }
      );
      const tgJson = await tgRes.json();

      if (!tgJson.ok) {
        return NextResponse.json({
          message,
          telegram: { sent: false, error: tgJson.description },
        });
      }

      return NextResponse.json({
        message,
        telegram: { sent: true, messageId: tgJson.result?.message_id },
      });
    }

    return NextResponse.json({
      message,
      telegram: { sent: false, error: 'TELEGRAM_ALERT_CHAT_ID not configured' },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'unknown error' },
      { status: 500 }
    );
  }
}
