'use client';

import { Activity, CheckCircle, Search, AlertOctagon } from 'lucide-react';
import type { OperationsStats as Stats } from '@/hooks/useOperations';

interface OperationsStatsProps {
  stats: Stats;
}

const STAT_CARDS = [
  { key: 'total' as const, label: '전체', icon: Activity, color: 'text-blue-500' },
  { key: 'autoResolved' as const, label: '자동 해결', icon: CheckCircle, color: 'text-emerald-500' },
  { key: 'investigating' as const, label: '조사 중', icon: Search, color: 'text-amber-500' },
  { key: 'escalated' as const, label: '에스컬레이션', icon: AlertOctagon, color: 'text-red-500' },
];

export function OperationsStats({ stats }: OperationsStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${color}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {stats[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
