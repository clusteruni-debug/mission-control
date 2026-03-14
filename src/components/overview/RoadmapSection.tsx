'use client';

import { cn } from '@/lib/utils';
import { Target } from 'lucide-react';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/constants';
import type { ProjectPriority, ProjectSnapshot } from '@/types';

interface RoadmapSectionProps {
  snapshots: ProjectSnapshot[];
}

export function RoadmapSection({ snapshots }: RoadmapSectionProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          프로젝트 로드맵
        </h3>
      </div>
      <div className="space-y-3">
        {(['high', 'medium', 'low', 'maintenance'] as ProjectPriority[]).map((priority) => {
          const items = snapshots.filter((s) => s.project.priority === priority);
          if (items.length === 0) return null;
          return (
            <div key={priority}>
              <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                {PRIORITY_LABELS[priority]}
              </p>
              <div className="space-y-2">
                {items.map((s) => {
                  const phase = s.livePhase ?? s.project.phase ?? '—';
                  const pct = s.project.completionPct ?? 0;
                  return (
                    <div
                      key={s.project.folder}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800"
                    >
                      <span className="w-28 truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                        {s.project.name}
                      </span>
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', PRIORITY_COLORS[priority])}>
                        {phase}
                      </span>
                      <div className="flex-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              pct >= 80
                                ? 'bg-green-500'
                                : pct >= 50
                                  ? 'bg-blue-500'
                                  : 'bg-yellow-500'
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-8 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
