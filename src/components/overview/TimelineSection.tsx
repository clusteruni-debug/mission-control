'use client';

import { cn, formatRelativeDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { TimelineItem } from './types';
import { TIMELINE_META } from './timeline-utils';

interface TimelineSectionProps {
  timeline: TimelineItem[];
  loading: boolean;
}

export function TimelineSection({ timeline, loading }: TimelineSectionProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        통합 타임라인
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            활동 데이터 로딩 중...
          </span>
        </div>
      ) : timeline.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          아직 활동이 없습니다
        </p>
      ) : (
        <div className="space-y-0">
          {timeline.map((item, i) => {
            const meta = TIMELINE_META[item.type];
            return (
              <div
                key={`${item.type}-${item.timestamp}-${i}`}
                className="flex items-start gap-3 border-l-2 border-gray-200 py-2.5 pl-4 dark:border-gray-700"
              >
                <div
                  className={cn(
                    '-ml-[21px] mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                    meta.bg
                  )}
                >
                  <meta.Icon className={cn('h-3 w-3', meta.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-xs font-medium',
                        meta.bg,
                        meta.color
                      )}
                    >
                      {meta.label}
                    </span>
                    <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                      {item.title}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-gray-400 dark:text-gray-500">
                      {formatRelativeDate(item.timestamp)}
                    </span>
                  </div>
                  {item.detail && (
                    <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-400">
                      {item.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
