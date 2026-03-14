import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function isVercelCron(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return request.headers.get('authorization') === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isVercelCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secret = process.env.COLLECTOR_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'COLLECTOR_SECRET not configured' },
      { status: 500 }
    );
  }

  try {
    const origin = request.nextUrl.origin;

    const res = await fetch(`${origin}/api/snapshot`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });

    const data = await res.json().catch(() => ({
      error: `Snapshot API returned non-JSON (HTTP ${res.status})`,
    }));

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cron snapshot failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
