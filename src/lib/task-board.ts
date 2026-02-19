import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { TaskBoardItem } from '@/types';

const DEFAULT_GITHUB_RAW =
  'https://raw.githubusercontent.com/clusteruni-debug/vibe-coding-workspace/master/AGENT_TASK_BOARD.md';

export function parseTaskTable(markdown: string): TaskBoardItem[] {
  const lines = markdown.split(/\r?\n/);
  const headerIndex = lines.findIndex(
    (line) =>
      line.includes('| TASK-ID |') &&
      line.includes('| Project |') &&
      line.includes('| Owner-Agent |')
  );
  if (headerIndex < 0 || headerIndex + 2 >= lines.length) return [];

  const rows: TaskBoardItem[] = [];
  for (let i = headerIndex + 2; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) break;

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());

    if (cells.length < 9) continue;
    if (cells[0].toUpperCase() === 'TASK-ID') continue;

    rows.push({
      taskId: cells[0],
      project: cells[1],
      type: cells[2],
      owner: cells[3],
      scopeFiles: cells[4],
      status: cells[5].toLowerCase(),
      notes: cells[8],
    });
  }

  return rows;
}

export async function readLocalTaskBoard(): Promise<string | null> {
  const filePath =
    process.env.TASK_BOARD_PATH ||
    path.resolve(process.cwd(), '..', '..', 'AGENT_TASK_BOARD.md');
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function readRemoteTaskBoard(): Promise<string | null> {
  try {
    const res = await fetch(DEFAULT_GITHUB_RAW, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function getTaskBoardItems(): Promise<TaskBoardItem[]> {
  const local = await readLocalTaskBoard();
  const raw = local ?? (await readRemoteTaskBoard());
  if (!raw) return [];
  return parseTaskTable(raw);
}
