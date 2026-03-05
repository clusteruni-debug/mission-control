import { NextResponse } from 'next/server';
import { GITHUB_OWNER } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const WORKSPACE_REPO = 'vibe-coding-workspace';
const GITHUB_API = 'https://api.github.com';

const headers: Record<string, string> = {
  Accept: 'application/vnd.github.v3+json',
};

if (typeof process !== 'undefined' && process.env.GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
}

interface DocHealthItem {
  name: string;
  status: 'ok' | 'warn' | 'critical';
  message: string;
  value?: number;
}

async function fetchFileContent(path: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${WORKSPACE_REPO}/contents/${path}`,
      { headers }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}

function checkChangelog(content: string): DocHealthItem {
  const lines = content.split('\n').length;
  let status: DocHealthItem['status'] = 'ok';
  let message = `${lines} lines`;
  if (lines > 1000) { status = 'critical'; message += ' — needs rotation'; }
  else if (lines > 500) { status = 'warn'; message += ' — consider rotation'; }
  return { name: 'CHANGELOG.md', status, message, value: lines };
}

function checkTaskBoard(content: string): DocHealthItem {
  const doneCount = (content.match(/\|\s*done\s*\|/gi) || []).length;
  const activeCount = (content.match(/\|\s*(?:todo|in_progress|review|blocked)\s*\|/gi) || []).length;
  let status: DocHealthItem['status'] = 'ok';
  let message = `${activeCount} active, ${doneCount} done`;
  if (doneCount > 20) { status = 'critical'; message += ' — archive done tasks'; }
  else if (doneCount > 10) { status = 'warn'; message += ' — accumulating'; }
  return { name: 'AGENT_TASK_BOARD', status, message, value: doneCount };
}

function checkHandoff(content: string): DocHealthItem {
  const lines = content.split('\n').length;
  // Check auto-generated timestamp
  const dateMatch = content.match(/Auto-generated.*?(\d{4}-\d{2}-\d{2})/);
  let status: DocHealthItem['status'] = 'ok';
  let message = `${lines} lines`;
  if (dateMatch) {
    const genDate = new Date(dateMatch[1]);
    const daysSince = Math.floor((Date.now() - genDate.getTime()) / 86400000);
    message += `, generated ${daysSince}d ago`;
    if (daysSince > 7) { status = 'critical'; message += ' — stale'; }
    else if (daysSince > 3) { status = 'warn'; }
  }
  return { name: 'HANDOFF-WEB.md', status, message, value: lines };
}

function checkSection6(handoffContent: string, projectCommits: Map<string, number>): DocHealthItem[] {
  const items: DocHealthItem[] = [];
  const s6Match = handoffContent.match(/## §6[^\n]*\n([\s\S]*?)(?=\n## §7|\Z)/);
  if (!s6Match) return items;
  const sections = s6Match[1].match(/###\s+(.+)/g) || [];
  const titleToProject: Record<string, string> = {
    'make money': 'make-money-project',
    'openclaw': 'openclaw-bot',
    'kimchi': 'Kimpbotforme',
    'navigator': 'To-do-list-for-adhd',
    'mission control': 'mission-control',
    'telegram': 'telegram-event-bot',
    'tradinglab': 'coin-test-project',
  };

  for (const section of sections) {
    const title = section.replace(/###\s+/, '').trim();
    if (title.toLowerCase().includes('planned')) continue;
    const lower = title.toLowerCase();
    let matched = false;
    for (const [keyword, repo] of Object.entries(titleToProject)) {
      if (lower.includes(keyword)) {
        const days = projectCommits.get(repo);
        if (days !== undefined && days >= 14) {
          items.push({
            name: `§6: ${title}`,
            status: days >= 30 ? 'critical' : 'warn',
            message: `Last commit ${days}d ago`,
            value: days,
          });
        }
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Can't determine staleness without repo mapping
    }
  }
  return items;
}

export async function GET() {
  try {
    const [changelog, taskBoard, handoff] = await Promise.all([
      fetchFileContent('CHANGELOG.md'),
      fetchFileContent('AGENT_TASK_BOARD.md'),
      fetchFileContent('docs/HANDOFF-WEB.md'),
    ]);

    const items: DocHealthItem[] = [];

    if (changelog) items.push(checkChangelog(changelog));
    else items.push({ name: 'CHANGELOG.md', status: 'critical', message: 'Not found' });

    if (taskBoard) items.push(checkTaskBoard(taskBoard));
    else items.push({ name: 'AGENT_TASK_BOARD', status: 'warn', message: 'Not found' });

    if (handoff) {
      items.push(checkHandoff(handoff));
      // §6 stale check needs project commit data — skip for now to avoid extra API calls
      // Will add project commit days from the existing scan data
    } else {
      items.push({ name: 'HANDOFF-WEB.md', status: 'critical', message: 'Not found' });
    }

    const summary = {
      ok: items.filter(i => i.status === 'ok').length,
      warn: items.filter(i => i.status === 'warn').length,
      critical: items.filter(i => i.status === 'critical').length,
    };

    return NextResponse.json({ items, summary, scannedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Doc health check failed:', error);
    return NextResponse.json({ error: 'Doc health check failed' }, { status: 500 });
  }
}
