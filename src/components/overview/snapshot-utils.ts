import type { SnapshotRow, TrendPoint } from './types';

export function extractBalanceSeries(rows: SnapshotRow[]): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const row of rows) {
    const mm = row.make_money as { data?: { balance?: number }; balance?: number } | null;
    const balance = mm?.data?.balance ?? mm?.balance;
    if (typeof balance === 'number') {
      points.push({ timestamp: row.created_at, value: balance });
    }
  }
  return points;
}

export function extractParticipationSeries(rows: SnapshotRow[]): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const row of rows) {
    const ev = row.events as { data?: { total?: number; participated?: number } } | null;
    const total = ev?.data?.total;
    const participated = ev?.data?.participated;
    if (typeof total === 'number' && total > 0 && typeof participated === 'number') {
      points.push({
        timestamp: row.created_at,
        value: Math.round((participated / total) * 100),
      });
    }
  }
  return points;
}

export function extractProjectCountSeries(rows: SnapshotRow[]): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const row of rows) {
    const ps = row.project_stats as { total?: number } | null;
    if (typeof ps?.total === 'number') {
      points.push({ timestamp: row.created_at, value: ps.total });
    }
  }
  return points;
}
