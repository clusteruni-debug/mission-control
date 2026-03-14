import { getSupabaseAdmin } from './supabase-admin';
import type { SnapshotRow } from '@/components/overview/types';

let cachedSnapshot: { row: SnapshotRow; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60_000; // 1 minute in-memory cache

export async function getLatestSnapshot(): Promise<SnapshotRow | null> {
  if (cachedSnapshot && Date.now() - cachedSnapshot.fetchedAt < CACHE_TTL_MS) {
    return cachedSnapshot.row;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('mc_snapshots')
      .select('created_at, make_money, watchbot, events')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      cachedSnapshot = { row: data as SnapshotRow, fetchedAt: Date.now() };
    }
    return (data as SnapshotRow) ?? null;
  } catch {
    return cachedSnapshot?.row ?? null;
  }
}

export function snapshotResponse(
  pathData: Record<string, unknown> | null | undefined,
  snapshotAt: string
) {
  if (pathData && typeof pathData === 'object' && 'data' in pathData) {
    return {
      ...pathData,
      _fromSnapshot: true,
      _snapshotAt: snapshotAt,
    };
  }

  return {
    data: pathData ?? null,
    status: 'offline' as const,
    fetchedAt: new Date().toISOString(),
    error: '스냅샷 데이터 없음',
    _fromSnapshot: true,
    _snapshotAt: snapshotAt,
  };
}
