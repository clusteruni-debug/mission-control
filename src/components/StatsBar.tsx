'use client';

import type { ProjectSnapshot } from '@/types';
import { GitCommit, FolderOpen, AlertTriangle, Activity } from 'lucide-react';

interface StatsBarProps {
  snapshots: ProjectSnapshot[];
}

export function StatsBar({ snapshots }: StatsBarProps) {
  const totalCommitsWeek = snapshots.reduce(
    (sum, s) => sum + s.git.commitCountWeek,
    0
  );
  const activeProjects = snapshots.filter(
    (s) => s.git.daysSinceCommit !== null && s.git.daysSinceCommit < 7
  ).length;
  const neglectedProjects = snapshots.filter(
    (s) => s.git.daysSinceCommit !== null && s.git.daysSinceCommit >= 7
  ).length;
  const runningProjects = snapshots.filter(
    (s) => s.project.category === 'running'
  ).length;

  const stats = [
    {
      label: '이번 주 커밋',
      value: totalCommitsWeek,
      icon: GitCommit,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: '활성 프로젝트',
      value: activeProjects,
      icon: Activity,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: '운영중',
      value: runningProjects,
      icon: FolderOpen,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      label: '방치 주의',
      value: neglectedProjects,
      icon: AlertTriangle,
      color: neglectedProjects > 0
        ? 'text-red-600 dark:text-red-400'
        : 'text-gray-400 dark:text-gray-500',
      bg: neglectedProjects > 0
        ? 'bg-red-50 dark:bg-red-950'
        : 'bg-gray-50 dark:bg-gray-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-xl border border-gray-200 p-4 dark:border-gray-800 ${stat.bg}`}
        >
          <div className="flex items-center gap-3">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
