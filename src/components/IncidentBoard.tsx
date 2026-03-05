'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useIncidents } from '@/hooks/useIncidents';
import { IncidentCard } from './incident-board/IncidentCard';
import { IncidentCreateForm } from './incident-board/IncidentCreateForm';

export function IncidentBoard() {
  const {
    incidents,
    loading,
    tableReady,
    openCount,
    refresh,
    createIncident,
    updateIncident,
    deleteIncident,
  } = useIncidents();
  const [showResolved, setShowResolved] = useState(false);

  if (!tableReady) {
    return (
      <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-950/20">
        <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-amber-500" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          mc_incidents 테이블이 아직 생성되지 않았습니다.
        </p>
        <p className="mt-1 text-xs text-amber-500">
          supabase/migrations/20260306_mc_incidents.sql을 실행해주세요.
        </p>
      </div>
    );
  }

  const openIncidents = incidents.filter((i) => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-4 w-4 ${openCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            인시던트
          </span>
          {openCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
              {openCount} 활성
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <IncidentCreateForm onSubmit={createIncident} />
          <button
            onClick={refresh}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Open incidents */}
      {openIncidents.length === 0 && !loading && (
        <p className="py-4 text-center text-xs text-gray-400">활성 인시던트 없음</p>
      )}
      {openIncidents.map((inc) => (
        <IncidentCard
          key={inc.id}
          incident={inc}
          onStatusChange={(id, status) => updateIncident(id, { status })}
          onDelete={deleteIncident}
        />
      ))}

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
          {showResolved &&
            resolvedIncidents.map((inc) => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                onStatusChange={(id, status) => updateIncident(id, { status })}
                onDelete={deleteIncident}
              />
            ))}
        </>
      )}
    </div>
  );
}
