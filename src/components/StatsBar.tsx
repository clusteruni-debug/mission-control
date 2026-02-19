'use client';

import { useEffect, useState } from 'react';
import type { ProjectSnapshot } from '@/types';
import type { ProxyResponse, ServiceStatus } from '@/types/status';
import {
  GitCommit,
  FolderOpen,
  AlertTriangle,
  Activity,
  DollarSign,
  CalendarCheck,
} from 'lucide-react';

interface StatsBarProps {
  snapshots: ProjectSnapshot[];
}

interface PortfolioData {
  totalPnL: number;
}

interface TelegramStatsData {
  total: number;
  participated: number;
}

export function StatsBar({ snapshots }: StatsBarProps) {
  const [pnlRes, setPnlRes] = useState<ProxyResponse<PortfolioData> | null>(null);
  const [eventRes, setEventRes] =
    useState<ProxyResponse<TelegramStatsData> | null>(null);

  useEffect(() => {
    const fetchExternalStats = async () => {
      try {
        const [pnl, event] = await Promise.all([
          fetch('/api/make-money?path=portfolio').then((r) => r.json()),
          fetch('/api/telegram-bot?path=stats').then((r) => r.json()),
        ]);
        setPnlRes(pnl);
        setEventRes(event);
      } catch {
        const fetchedAt = new Date().toISOString();
        const offlinePnl: ProxyResponse<PortfolioData> = {
          data: null,
          status: 'offline',
          fetchedAt,
          error: '프록시 연결 실패',
        };
        const offlineEvent: ProxyResponse<TelegramStatsData> = {
          data: null,
          status: 'offline',
          fetchedAt,
          error: '프록시 연결 실패',
        };
        setPnlRes(offlinePnl);
        setEventRes(offlineEvent);
      }
    };

    fetchExternalStats();
  }, []);

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

  const pnlStatus: ServiceStatus = pnlRes?.status ?? 'unknown';
  const eventStatus: ServiceStatus = eventRes?.status ?? 'unknown';
  const pnlOnline = pnlStatus === 'online' || pnlStatus === 'degraded';
  const eventOnline = eventStatus === 'online' || eventStatus === 'degraded';

  const pnlValue = pnlOnline ? pnlRes?.data?.totalPnL ?? null : null;
  const eventRate =
    eventOnline && eventRes?.data && eventRes.data.total > 0
      ? Math.round((eventRes.data.participated / eventRes.data.total) * 100)
      : null;

  const stats = [
    {
      label: '이번 주 커밋',
      value: totalCommitsWeek,
      icon: GitCommit,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
      title: undefined,
    },
    {
      label: '활성 프로젝트',
      value: activeProjects,
      icon: Activity,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950',
      title: undefined,
    },
    {
      label: '운영중',
      value: runningProjects,
      icon: FolderOpen,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950',
      title: undefined,
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
      title: undefined,
    },
    {
      label: '오늘 P&L',
      value:
        pnlValue === null
          ? '--'
          : `${pnlValue >= 0 ? '+' : '-'}$${Math.abs(pnlValue).toFixed(2)}`,
      icon: DollarSign,
      color:
        pnlValue === null
          ? 'text-gray-400 dark:text-gray-500'
          : pnlValue >= 0
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400',
      bg: 'bg-gray-50 dark:bg-gray-900',
      title:
        pnlValue === null
          ? `${pnlRes?.error || '서버 오프라인'} | ${pnlRes?.fetchedAt || '-'}`
          : `updated: ${pnlRes?.fetchedAt || '-'}`,
    },
    {
      label: '이벤트 참여율',
      value: eventRate === null ? '--' : `${eventRate}%`,
      icon: CalendarCheck,
      color:
        eventRate === null
          ? 'text-gray-400 dark:text-gray-500'
          : 'text-blue-600 dark:text-blue-400',
      bg: 'bg-gray-50 dark:bg-gray-900',
      title:
        eventRate === null
          ? `${eventRes?.error || '서버 오프라인'} | ${eventRes?.fetchedAt || '-'}`
          : `updated: ${eventRes?.fetchedAt || '-'}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          title={stat.title}
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
