import { NextRequest, NextResponse } from 'next/server';
import type { ServiceStatus } from '@/types/status';
import { PROJECTS } from '@/lib/constants';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type SnapshotRange = '24h' | '7d' | '30d';

type SnapshotRow = {
  id: number;
  created_at: string;
  project_stats: Record<string, unknown>;
  make_money: Record<string, unknown>;
  openclaw: Record<string, unknown>;
  events: Record<string, unknown>;
};

type ProxyResponse<T> = {
  data: T | null;
  status: ServiceStatus;
  fetchedAt: string;
  error?: string;
  responseTimeMs?: number;
};

const RANGE_CONFIG: Record<
  SnapshotRange,
  { lookbackMs: number; bucketMs: number; maxPoints: number }
> = {
  '24h': { lookbackMs: 24 * 60 * 60 * 1000, bucketMs: 5 * 60 * 1000, maxPoints: 288 },
  '7d': { lookbackMs: 7 * 24 * 60 * 60 * 1000, bucketMs: 30 * 60 * 1000, maxPoints: 336 },
  '30d': { lookbackMs: 30 * 24 * 60 * 60 * 1000, bucketMs: 60 * 60 * 1000, maxPoints: 720 },
};
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
let lastCleanupAt = 0;

function makeResponse<T>(
  payload: T | null,
  status: ServiceStatus,
  responseTimeMs: number,
  error?: string
): ProxyResponse<T> {
  return {
    data: payload,
    status,
    fetchedAt: new Date().toISOString(),
    responseTimeMs,
    ...(error ? { error } : {}),
  };
}

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.COLLECTOR_SECRET;
  if (!expected) return false;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${expected}`;
}

function toOfflinePayload(error: string) {
  return {
    status: 'offline',
    error,
  };
}

async function fetchJsonOrOffline(
  url: string,
  label: string
): Promise<Record<string, unknown>> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      return toOfflinePayload(`${label} HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return toOfflinePayload(`${label} ${message}`);
  }
}

function buildProjectStats() {
  const counts = PROJECTS.reduce(
    (acc, project) => {
      acc.total += 1;
      acc.byCategory[project.category] = (acc.byCategory[project.category] || 0) + 1;
      return acc;
    },
    {
      total: 0,
      byCategory: {} as Record<string, number>,
    }
  );

  return {
    total: counts.total,
    byCategory: counts.byCategory,
    updatedAt: new Date().toISOString(),
  };
}

function downsampleSnapshots(
  rows: SnapshotRow[],
  range: SnapshotRange
): SnapshotRow[] {
  const { bucketMs, maxPoints } = RANGE_CONFIG[range];
  const byBucket = new Map<number, SnapshotRow>();

  for (const row of rows) {
    const ts = new Date(row.created_at).getTime();
    const bucket = Math.floor(ts / bucketMs) * bucketMs;
    byBucket.set(bucket, row);
  }

  return Array.from(byBucket.values()).slice(-maxPoints);
}

export async function POST(request: NextRequest) {
  const start = Date.now();
  if (!isAuthorized(request)) {
    return NextResponse.json(
      makeResponse(null, 'offline', Date.now() - start, 'Unauthorized'),
      { status: 401 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const origin = request.nextUrl.origin;

    const [makeMoney, openclaw, events] = await Promise.all([
      fetchJsonOrOffline(`${origin}/api/make-money?path=portfolio`, 'make-money'),
      fetchJsonOrOffline(`${origin}/api/bot-status`, 'openclaw'),
      fetchJsonOrOffline(`${origin}/api/telegram-bot?path=stats`, 'telegram'),
    ]);

    const payload = {
      project_stats: buildProjectStats(),
      make_money: makeMoney,
      openclaw: openclaw,
      events: events,
    };

    const { data, error } = await supabase
      .from('mc_snapshots')
      .insert(payload)
      .select('id, created_at')
      .single();

    if (error) {
      return NextResponse.json(
        makeResponse(null, 'offline', Date.now() - start, error.message),
        { status: 500 }
      );
    }

    // Keep retention cleanup isolated from main insert flow.
    if (Date.now() - lastCleanupAt > CLEANUP_INTERVAL_MS) {
      lastCleanupAt = Date.now();
      try {
        const cutoff = new Date(Date.now() - RANGE_CONFIG['30d'].lookbackMs).toISOString();
        await supabase.from('mc_snapshots').delete().lt('created_at', cutoff);
      } catch {
        // Retention cleanup errors must not affect snapshot ingestion.
      }
    }

    return NextResponse.json(
      makeResponse(data, 'online', Date.now() - start)
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Snapshot insert failed';
    return NextResponse.json(
      makeResponse(null, 'offline', Date.now() - start, message),
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const start = Date.now();
  const rawRange = request.nextUrl.searchParams.get('range') as SnapshotRange | null;
  const range: SnapshotRange =
    rawRange && rawRange in RANGE_CONFIG ? rawRange : '24h';

  try {
    const supabase = getSupabaseAdmin();
    const since = new Date(Date.now() - RANGE_CONFIG[range].lookbackMs).toISOString();

    const { data, error } = await supabase
      .from('mc_snapshots')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(2000);

    if (error) {
      return NextResponse.json(
        makeResponse(null, 'offline', Date.now() - start, error.message),
        { status: 500 }
      );
    }

    const rows = (data || []) as SnapshotRow[];
    const sampled = downsampleSnapshots(rows, range);
    const meta = {
      totalRows: rows.length,
      oldestAt: rows.length ? rows[0].created_at : null,
      newestAt: rows.length ? rows[rows.length - 1].created_at : null,
    };

    return NextResponse.json(
      {
        ...makeResponse(sampled, 'online', Date.now() - start),
        meta,
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Snapshot fetch failed';
    return NextResponse.json(
      makeResponse(null, 'offline', Date.now() - start, message),
      { status: 500 }
    );
  }
}
