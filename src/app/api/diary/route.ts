import { NextResponse } from 'next/server';
import { GITHUB_OWNER } from '@/lib/constants';
import type { DiarySession, DiaryDay } from '@/types/diary';

export const dynamic = 'force-dynamic';

const WORKSPACE_REPO = 'vibe-coding-workspace';
const GITHUB_API = 'https://api.github.com';
const MAX_DAYS = 14;

const headers: Record<string, string> = {
  Accept: 'application/vnd.github.v3+json',
};

if (typeof process !== 'undefined' && process.env.GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
}

// Regex patterns ported from doc-rotate.py
const SESSION_SPLIT = /(?=^### Session )/m;
const SESSION_HEADER = /^### Session (\S+)\s*(?:\(([^,]+),\s*([^)]+)\))?/;
const PROJECT_RE = /\*\*(?:Project|프로젝트)\*\*:\s*(.+)/;
const TASK_RE = /\*\*(?:Task|작업)\*\*:\s*(.+)/;
const RESULT_BULLET_RE = /\*\*(?:Result|결과)\*\*:\s*\n((?:\s*- .+\n?){1,3})/;
const RESULT_INLINE_RE = /\*\*(?:Result|결과)\*\*:\s*(.+)/;
const NEXT_RE = /\*\*(?:Next|다음)\*\*:\s*(.+)/;
const MONITORING_RE = /monitor|monitoring|awaiting|deploy|redeploy|verify|confirm|배포|확인/i;

function parseSession(block: string): DiarySession | null {
  const headerMatch = block.match(SESSION_HEADER);
  if (!headerMatch) return null;

  const index = headerMatch[1];
  const tool = headerMatch[2]?.trim();
  const model = headerMatch[3]?.trim();

  const taskMatch = block.match(TASK_RE);
  const projectMatch = block.match(PROJECT_RE);
  const nextMatch = block.match(NEXT_RE);

  const task = taskMatch?.[1]?.trim() ?? 'Unknown';
  const project = projectMatch?.[1]?.trim() ?? 'Unknown';
  const next = nextMatch?.[1]?.trim();

  // Extract result lines (bullet or inline)
  let resultLines: string[] = [];
  const bulletMatch = block.match(RESULT_BULLET_RE);
  if (bulletMatch) {
    resultLines = bulletMatch[1]
      .split('\n')
      .map((l) => l.replace(/^\s*-\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 3);
  } else {
    const inlineMatch = block.match(RESULT_INLINE_RE);
    if (inlineMatch) {
      resultLines = [inlineMatch[1].trim()];
    }
  }

  const status = next && MONITORING_RE.test(next) ? 'Monitoring' : 'Complete';

  return { index, tool, model, task, project, resultLines, next, status };
}

function parseDiaryFile(content: string, filename: string): DiaryDay | null {
  const date = filename.replace('.md', '');
  const blocks = content.split(SESSION_SPLIT).filter((b) => b.startsWith('### Session'));

  if (blocks.length === 0) return null;

  const sessions: DiarySession[] = [];
  const projectSummary: Record<string, number> = {};

  for (const block of blocks) {
    const session = parseSession(block);
    if (!session) continue;
    sessions.push(session);
    projectSummary[session.project] = (projectSummary[session.project] ?? 0) + 1;
  }

  if (sessions.length === 0) return null;

  return { date, sessionCount: sessions.length, sessions, projectSummary };
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

export async function GET() {
  try {
    // List diary directory
    const dirRes = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${WORKSPACE_REPO}/contents/memory/diary`,
      { headers }
    );

    if (!dirRes.ok) {
      return NextResponse.json({ days: [], scannedAt: new Date().toISOString() });
    }

    const files: { name: string; type: string }[] = await dirRes.json();
    const mdFiles = files
      .filter((f) => f.type === 'file' && f.name.endsWith('.md'))
      .map((f) => f.name)
      .sort()
      .reverse()
      .slice(0, MAX_DAYS);

    // Fetch files in parallel
    const contents = await Promise.all(
      mdFiles.map(async (name) => {
        const content = await fetchFileContent(`memory/diary/${name}`);
        return { name, content };
      })
    );

    const days: DiaryDay[] = [];
    for (const { name, content } of contents) {
      if (!content) continue;
      const day = parseDiaryFile(content, name);
      if (day) days.push(day);
    }

    return NextResponse.json({ days, scannedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Diary fetch failed:', error);
    return NextResponse.json({ error: 'Diary fetch failed' }, { status: 500 });
  }
}
