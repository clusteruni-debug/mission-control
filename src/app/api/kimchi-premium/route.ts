import { NextResponse } from 'next/server';

export const revalidate = 60;

const BASE_URL = 'http://localhost:5100';

export async function GET() {
  const fetchedAt = new Date().toISOString();
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(BASE_URL, { signal: controller.signal });
    clearTimeout(timeout);

    const responseTimeMs = Date.now() - start;

    if (!res.ok) {
      return NextResponse.json({
        status: 'offline',
        fetchedAt,
        responseTimeMs,
        error: `HTTP ${res.status}`,
      });
    }

    // Vite dev server는 HTML 반환 — 200이면 online
    return NextResponse.json({
      status: responseTimeMs >= 3000 ? 'degraded' : 'online',
      fetchedAt,
      responseTimeMs,
    });
  } catch {
    return NextResponse.json({
      status: 'offline',
      fetchedAt,
      responseTimeMs: Date.now() - start,
      error: '서비스 미실행',
    });
  }
}
