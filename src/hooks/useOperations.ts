'use client';

import { useMemo, useState } from 'react';
import { useIncidents } from './useIncidents';
import type { Incident } from '@/types';

export type TimeRange = '24h' | '7d' | '30d';

const RANGE_MS: Record<TimeRange, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

export interface OperationsStats {
  total: number;
  autoResolved: number;
  investigating: number;
  escalated: number;
}

export function useOperations() {
  const {
    incidents,
    loading,
    tableReady,
    openCount,
    refresh,
    createIncident,
    updateIncident,
    deleteIncident,
  } = useIncidents(30000);

  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  const filtered = useMemo(() => {
    const cutoff = Date.now() - RANGE_MS[timeRange];
    return incidents.filter((inc) => new Date(inc.detected_at).getTime() >= cutoff);
  }, [incidents, timeRange]);

  const stats = useMemo<OperationsStats>(() => {
    return {
      total: filtered.length,
      autoResolved: filtered.filter(
        (i) => i.source === 'auto-recovery' && i.status === 'resolved'
      ).length,
      investigating: filtered.filter((i) => i.status === 'investigating').length,
      escalated: filtered.filter(
        (i) => i.status === 'investigating' && i.severity === 'critical'
      ).length,
    };
  }, [filtered]);

  const openIncidents = useMemo(
    () => filtered.filter((i) => i.status !== 'resolved'),
    [filtered]
  );

  const resolvedIncidents = useMemo(
    () => filtered.filter((i) => i.status === 'resolved'),
    [filtered]
  );

  // Use filtered openCount (not the all-time one from useIncidents)
  const filteredOpenCount = openIncidents.length;

  return {
    incidents: filtered,
    openIncidents,
    resolvedIncidents,
    stats,
    loading,
    tableReady,
    openCount: filteredOpenCount,
    timeRange,
    setTimeRange,
    refresh,
    createIncident,
    updateIncident,
    deleteIncident,
  };
}
