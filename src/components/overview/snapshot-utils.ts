import type { SnapshotRow, TrendPoint } from './types';

export function extractBalanceSeries(rows: SnapshotRow[]): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const row of rows) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mm = row.make_money as any;
    // New nested format: mm.portfolio.data.balance
    // Legacy flat format: mm.data.balance or mm.balance
    const balance =
      mm?.portfolio?.data?.balance ?? mm?.data?.balance ?? mm?.balance;
    if (typeof balance === 'number') {
      points.push({ timestamp: row.created_at, value: balance });
    }
  }
  return points;
}

export function extractParticipationSeries(rows: SnapshotRow[]): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const row of rows) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ev = row.events as any;
    // New nested format: ev.stats.data.{total,participated}
    // Legacy flat format: ev.data.{total,participated}
    const total = ev?.stats?.data?.total ?? ev?.data?.total;
    const participated = ev?.stats?.data?.participated ?? ev?.data?.participated;
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
