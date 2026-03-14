import { NextResponse } from 'next/server';
import { getLatestSnapshot } from '@/lib/snapshot-fallback';

export const revalidate = 300; // 5분 캐시

// WatchBot health_api.py 실제 응답 형식
export interface BotHealthResponse {
  recent_tasks: {
    id: number;
    task: string;
    timestamp: string | null;
    success: boolean | null;
  }[];
  success_rate: number;
  last_run: string | null;
  scheduled: {
    id: number;
    chat_id: number;
    task: string;
    cron_expr: string | null;
    run_at: string | null;
  }[];
  uptime: number;
}

export async function GET() {
  // On Vercel, proxy can't reach WSL localhost — fall back to snapshot
  if (process.env.VERCEL) {
    const snapshot = await getLatestSnapshot();
    if (!snapshot?.watchbot) {
      return NextResponse.json({
        status: 'offline',
        recent_tasks: [],
        success_rate: 0,
        last_run: null,
        scheduled: [],
        uptime: 0,
        error: '스냅샷 데이터 없음',
      });
    }

    return NextResponse.json({
      ...snapshot.watchbot,
      _fromSnapshot: true,
      _snapshotAt: snapshot.created_at,
    });
  }

  // Local: proxy to WatchBot
  const healthUrl =
    process.env.WATCHBOT_HEALTH_URL || 'http://localhost:7100/health';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(healthUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { status: 'offline', error: `HTTP ${res.status}` },
        { status: 200 }
      );
    }

    const data: BotHealthResponse = await res.json();
    return NextResponse.json({ status: 'online', ...data });
  } catch {
    return NextResponse.json({
      status: 'offline',
      recent_tasks: [],
      success_rate: 0,
      last_run: null,
      scheduled: [],
      uptime: 0,
    });
  }
}
