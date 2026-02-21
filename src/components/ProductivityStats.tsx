'use client';

import type { ProjectSnapshot } from '@/types';
import { cn } from '@/lib/utils';

interface ProductivityStatsProps {
  snapshots: ProjectSnapshot[];
}

export function ProductivityStats({ snapshots }: ProductivityStatsProps) {
  // 프로젝트별 이번 주 커밋으로 간단한 바 차트
  const projectCommits = snapshots
    .map((s) => ({
      name: s.project.name,
      commits: s.git.commitCountWeek,
      category: s.project.category,
    }))
    .sort((a, b) => b.commits - a.commits);

  const maxCommits = Math.max(...projectCommits.map((p) => p.commits), 1);

  // streak 계산: 연속 커밋 일수 (최근 커밋 기반)
  const allCommitDates = snapshots
    .flatMap((s) => (s.git.recentCommits ?? []).map((c) => c.date))
    .map((d) => new Date(d).toDateString());

  const uniqueDates = [...new Set(allCommitDates)].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    if (uniqueDates.includes(checkDate.toDateString())) {
      streak++;
    } else if (i > 0) {
      break; // 오늘은 아직 안 했을 수도 있으니 첫날은 건너뜀
    }
  }

  // 7일간 활동 히트맵
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const count = allCommitDates.filter((cd) => cd === dateStr).length;
    return {
      day: d.toLocaleDateString('ko-KR', { weekday: 'short' }),
      count,
      date: d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    };
  });

  const maxDaily = Math.max(...last7Days.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Streak + 주간 히트맵 */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {streak}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">연속 일</p>
        </div>
        <div className="flex flex-1 items-end gap-1">
          {last7Days.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  'w-full rounded-sm transition-all',
                  day.count === 0
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : day.count <= maxDaily * 0.33
                      ? 'bg-green-200 dark:bg-green-900'
                      : day.count <= maxDaily * 0.66
                        ? 'bg-green-400 dark:bg-green-700'
                        : 'bg-green-600 dark:bg-green-500'
                )}
                style={{
                  height: `${Math.max(8, (day.count / maxDaily) * 48)}px`,
                }}
              />
              <span className="text-[10px] text-gray-400">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 프로젝트별 커밋 바 차트 */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          이번 주 프로젝트별 커밋
        </p>
        {projectCommits.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-24 truncate text-xs text-gray-600 dark:text-gray-300">
              {p.name}
            </span>
            <div className="flex-1">
              <div
                className={cn(
                  'h-4 rounded-sm transition-all',
                  p.commits === 0
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'bg-blue-500 dark:bg-blue-400'
                )}
                style={{
                  width: `${Math.max(2, (p.commits / maxCommits) * 100)}%`,
                }}
              />
            </div>
            <span className="w-8 text-right text-xs font-medium text-gray-500">
              {p.commits}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
