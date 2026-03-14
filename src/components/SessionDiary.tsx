'use client';

import { useState, useEffect } from 'react';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import type { DiaryDay, DiaryResult } from '@/types/diary';

export function SessionDiary() {
  const [days, setDays] = useState<DiaryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/diary')
      .then((res) => res.json())
      .then((data: DiaryResult) => setDays(Array.isArray(data?.days) ? data.days : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (date: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">
        다이어리 기록이 없습니다
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {days.map((day) => {
        const isOpen = expanded.has(day.date);
        const dateLabel = formatDateLabel(day.date);
        const projectTags = Object.entries(day.projectSummary)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4);

        return (
          <div key={day.date}>
            {/* Compact row */}
            <button
              onClick={() => toggle(day.date)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              )}

              <span className="w-16 flex-shrink-0 font-mono text-xs text-gray-500 dark:text-gray-400">
                {dateLabel}
              </span>

              <span className="flex-shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                {day.sessionCount}건
              </span>

              <div className="flex min-w-0 flex-1 gap-1.5 overflow-hidden">
                {projectTags.map(([name, count]) => (
                  <span
                    key={name}
                    className="flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {name}({count})
                  </span>
                ))}
                {Object.keys(day.projectSummary).length > 4 && (
                  <span className="flex-shrink-0 text-xs text-gray-400">
                    +{Object.keys(day.projectSummary).length - 4}
                  </span>
                )}
              </div>
            </button>

            {/* Expanded sessions */}
            {isOpen && (
              <div className="mb-2 ml-9 space-y-1 border-l-2 border-gray-200 pl-3 dark:border-gray-700">
                {day.sessions.map((s, i) => (
                  <div key={i} className="py-1">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="flex-shrink-0 font-mono text-xs text-gray-400">
                        #{s.index}
                      </span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {s.project}
                      </span>
                      <span className="min-w-0 flex-1 text-gray-700 dark:text-gray-200">
                        {s.task}
                      </span>
                      {s.tool && (
                        <span className="flex-shrink-0 text-xs text-gray-400">
                          {s.tool}
                        </span>
                      )}
                      {s.status === 'Monitoring' && (
                        <span className="flex-shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                          monitoring
                        </span>
                      )}
                    </div>
                    {s.resultLines.length > 0 && (
                      <ul className="mt-0.5 ml-6 space-y-0 text-xs text-gray-500 dark:text-gray-400">
                        {s.resultLines.map((line, j) => (
                          <li key={j} className="truncate">
                            - {line}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return '오늘';
  if (d.toDateString() === yesterday.toDateString()) return '어제';

  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
