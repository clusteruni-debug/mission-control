'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOperations } from '@/hooks/useOperations';
import type { TimeRange } from '@/hooks/useOperations';
import { OperationsStats } from './operations/OperationsStats';
import { OperationCard } from './operations/OperationCard';
import { IncidentCreateForm } from './incident-board/IncidentCreateForm';

const TIME_RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '24시간', value: '24h' },
  { label: '7일', value: '7d' },
  { label: '30일', value: '30d' },
];

export function OperationsPanel() {
  const {
    openIncidents,
    resolvedIncidents,
    stats,
    loading,
    tableReady,
    openCount,
    timeRange,
    setTimeRange,
    refresh,
    createIncident,
    updateIncident,
    deleteIncident,
  } = useOperations();

  const [showResolved, setShowResolved] = useState(false);

  if (!tableReady) {
    return (
      <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-950/20">
        <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-amber-500" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          mc_incidents 테이블이 아직 생성되지 않았습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <OperationsStats stats={stats} />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn('h-4 w-4', openCount > 0 ? 'text-red-500' : 'text-gray-400')} />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            운영 타임라인
          </span>
          {openCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
              {openCount} 활성
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
            {TIME_RANGE_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg',
                  timeRange === value
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <IncidentCreateForm onSubmit={createIncident} />
          <button
            onClick={refresh}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Open incidents */}
      {loading && openIncidents.length === 0 && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="ml-2 text-xs text-gray-400">불러오는 중...</span>
        </div>
      )}
      {openIncidents.length === 0 && !loading && (
        <p className="py-4 text-center text-xs text-gray-400">활성 인시던트 없음</p>
      )}
      <div className="space-y-2">
        {openIncidents.map((inc) => (
          <OperationCard
            key={inc.id}
            incident={inc}
            onStatusChange={(id, status) => updateIncident(id, { status })}
            onDelete={deleteIncident}
          />
        ))}
      </div>

      {/* Resolved toggle */}
      {resolvedIncidents.length > 0 && (
        <>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showResolved ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            해결된 인시던트 ({resolvedIncidents.length})
          </button>
          {showResolved && (
            <div className="space-y-2">
              {resolvedIncidents.map((inc) => (
                <OperationCard
                  key={inc.id}
                  incident={inc}
                  onStatusChange={(id, status) => updateIncident(id, { status })}
                  onDelete={deleteIncident}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
