import { NextResponse } from 'next/server';

export const revalidate = 300; // 5분 캐시

// Watch Bot (구 OpenClaw) health_api.py 실제 응답 형식
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
  const healthUrl =
    process.env.OPENCLAW_HEALTH_URL || 'http://localhost:7100/health';

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
    // WSL 환경 아닐 때 or Watch Bot 미실행 시 graceful fallback
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
