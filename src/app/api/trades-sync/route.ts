import { NextRequest, NextResponse } from 'next/server';
import type { ServiceStatus } from '@/types/status';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type TradeRange = '24h' | '7d' | '30d';

type ProxyResponse<T> = {
  data: T | null;
  status: ServiceStatus;
  fetchedAt: string;
  error?: string;
  responseTimeMs?: number;
};

type TradeRow = {
  market: string;
  side: string;
  pnl: number;
  trade_ts: string;
  raw_data: Record<string, unknown>;
};

const RANGE_MS: Record<TradeRange, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

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

function toIsoTimestamp(value: unknown): string {
  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  return new Date().toISOString();
}

function toTradeRow(raw: Record<string, unknown>): TradeRow {
  const market =
    (typeof raw.market === 'string' && raw.market) ||
    (typeof raw.symbol === 'string' && raw.symbol) ||
    'UNKNOWN';
  const side =
    (typeof raw.side === 'string' && raw.side) ||
    (typeof raw.status === 'string' && raw.status) ||
    'unknown';

  let pnl = 0;
  if (typeof raw.pnl === 'number') {
    pnl = raw.pnl;
  } else if (
    typeof raw.exit_proceeds === 'number' &&
    typeof raw.filled_cost === 'number'
  ) {
    pnl = raw.exit_proceeds - raw.filled_cost;
  }

  const trade_ts = toIsoTimestamp(
    raw.timestamp ?? raw.entry_timestamp ?? raw.created_at
  );

  return {
    market,
    side,
    pnl,
    trade_ts,
    raw_data: raw,
  };
}

async function fetchTrades(origin: string): Promise<Record<string, unknown>[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${origin}/api/make-money?path=trades`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json || typeof json !== 'object') return [];
    if (!Array.isArray((json as { data?: unknown }).data)) return [];
    return (json as { data: Record<string, unknown>[] }).data;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
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

    const rawTrades = await fetchTrades(origin);
    const rows = rawTrades.map(toTradeRow);

    if (!rows.length) {
      return NextResponse.json(
        makeResponse({ inserted: 0, attempted: 0 }, 'online', Date.now() - start)
      );
    }

    const { data, error } = await supabase
      .from('mc_trades')
      .upsert(rows, {
        onConflict: 'market,side,trade_ts',
        ignoreDuplicates: true,
      })
      .select('id');

    if (error) {
      return NextResponse.json(
        makeResponse(null, 'offline', Date.now() - start, error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      makeResponse(
        { inserted: data?.length ?? 0, attempted: rows.length },
        'online',
        Date.now() - start
      )
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Trades sync failed';
    return NextResponse.json(
      makeResponse(null, 'offline', Date.now() - start, message),
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const start = Date.now();
  const rawRange = request.nextUrl.searchParams.get('range') as TradeRange | null;
  const range: TradeRange = rawRange && rawRange in RANGE_MS ? rawRange : '24h';

  try {
    const supabase = getSupabaseAdmin();
    const since = new Date(Date.now() - RANGE_MS[range]).toISOString();

    const { data, error } = await supabase
      .from('mc_trades')
      .select('id, market, side, pnl, trade_ts, raw_data, created_at')
      .gte('trade_ts', since)
      .order('trade_ts', { ascending: true })
      .limit(2000);

    if (error) {
      return NextResponse.json(
        makeResponse(null, 'offline', Date.now() - start, error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      makeResponse(data || [], 'online', Date.now() - start)
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Trades fetch failed';
    return NextResponse.json(
      makeResponse(null, 'offline', Date.now() - start, message),
      { status: 500 }
    );
  }
}

