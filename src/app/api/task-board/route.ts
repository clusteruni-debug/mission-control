import { NextResponse } from 'next/server';
import {
  parseTaskTable,
  readLocalTaskBoard,
  readRemoteTaskBoard,
} from '@/lib/task-board';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const local = await readLocalTaskBoard();
    const raw = local ?? (await readRemoteTaskBoard());
    if (!raw) {
      return NextResponse.json(
        { error: 'task board not found' },
        { status: 404 }
      );
    }

    const items = parseTaskTable(raw);
    const statusCounts = items.reduce<Record<string, number>>((acc, item) => {
      const key = item.status || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      items,
      total: items.length,
      statusCounts,
      source: local ? 'local' : 'github-raw',
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('task board route error:', error);
    return NextResponse.json(
      { error: 'task board parse failed' },
      { status: 500 }
    );
  }
}
