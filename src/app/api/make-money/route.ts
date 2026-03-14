import { NextRequest, NextResponse } from 'next/server';
import { createProxyResponse } from '@/types/status';
import { getLatestSnapshot, snapshotResponse } from '@/lib/snapshot-fallback';

export const revalidate = 60;

const BASE_URL =
  process.env.MAKE_MONEY_API_URL || 'http://localhost:3001';

const VALID_PATHS = ['portfolio', 'health', 'engines', 'trades', 'trades-deep'] as const;
type ValidPath = (typeof VALID_PATHS)[number];

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') as ValidPath | null;

  if (!path || !VALID_PATHS.includes(path)) {
    return NextResponse.json(
      { error: `Invalid path. Use: ${VALID_PATHS.join(', ')}` },
      { status: 400 }
    );
  }

  // On Vercel, proxy can't reach localhost — fall back to Supabase snapshot
  if (process.env.VERCEL) {
    const snapshot = await getLatestSnapshot();
    if (!snapshot) {
      return NextResponse.json({
        data: null,
        status: 'offline',
        fetchedAt: new Date().toISOString(),
        error: '스냅샷 데이터 없음 — 로컬에서 스냅샷 수집이 필요합니다',
      });
    }

    const mm = snapshot.make_money as Record<string, unknown> | null;
    // Support both new format { health: {}, portfolio: {} } and legacy flat format
    const snapshotPath = path === 'trades-deep' ? 'trades' : path;
    const pathData = mm?.[snapshotPath] as Record<string, unknown> | undefined;

    if (!pathData) {
      return NextResponse.json({
        data: null,
        status: 'offline',
        fetchedAt: new Date().toISOString(),
        error: '해당 경로의 스냅샷 데이터 없음',
        _fromSnapshot: true,
        _snapshotAt: snapshot.created_at,
      });
    }

    return NextResponse.json(snapshotResponse(pathData, snapshot.created_at));
  }

  // Local: proxy to Make Money server
  const apiPath =
    path === 'trades' ? '/api/trades?limit=5' :
    path === 'trades-deep' ? '/api/trades?limit=100' :
    `/api/${path}`;

  const result = await createProxyResponse(
    (signal) => fetch(`${BASE_URL}${apiPath}`, { signal }),
    5000
  );

  return NextResponse.json(result);
}
