'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ProxyResponse, ServiceStatus } from '@/types/status';
import { getStatusColor } from '@/types/status';
import { cn } from '@/lib/utils';
import { CalendarClock, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

interface TelegramHealth {
  status: string;
  uptime?: number;
}

interface TelegramStats {
  total: number;
  analyzed: number;
  participated: number;
  byChannel?: Record<string, number>;
}

interface TelegramAnalyzedItem {
  id: string | number;
  content?: string;
  deadline?: string;
  analysis?: unknown;
  participated?: boolean;
}

function statusBadgeClass(status: ServiceStatus): string {
  const color = getStatusColor(status);
  if (color === 'emerald') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
  if (color === 'amber') return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
  if (color === 'red') return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

function daysLeft(deadline?: string): number | null {
  if (!deadline) return null;
  const target = new Date(deadline).getTime();
  if (!Number.isFinite(target)) return null;
  return Math.ceil((target - Date.now()) / 86400000);
}

function inferReward(_analysis: unknown): string {
  return '--';
}

export function EventWidget() {
  const [statsRes, setStatsRes] = useState<ProxyResponse<TelegramStats> | null>(null);
  const [healthRes, setHealthRes] = useState<ProxyResponse<TelegramHealth> | null>(null);
  const [analyzedRes, setAnalyzedRes] = useState<ProxyResponse<TelegramAnalyzedItem[]> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [stats, health, analyzed] = await Promise.all([
        fetch('/api/telegram-bot?path=stats').then((r) => r.json()),
        fetch('/api/telegram-bot?path=health').then((r) => r.json()),
        fetch('/api/telegram-bot?path=analyzed').then((r) => r.json()),
      ]);
      setStatsRes(stats);
      setHealthRes(health);
      setAnalyzedRes(analyzed);
    } catch {
      const offlineStats: ProxyResponse<TelegramStats> = {
        data: null,
        status: 'offline',
        fetchedAt: new Date().toISOString(),
        error: 'Mission Control 프록시 연결 실패',
      };
      const offlineHealth: ProxyResponse<TelegramHealth> = {
        data: null,
        status: 'offline',
        fetchedAt: offlineStats.fetchedAt,
        error: offlineStats.error,
      };
      const offlineAnalyzed: ProxyResponse<TelegramAnalyzedItem[]> = {
        data: null,
        status: 'offline',
        fetchedAt: offlineStats.fetchedAt,
        error: offlineStats.error,
      };
      setStatsRes(offlineStats);
      setHealthRes(offlineHealth);
      setAnalyzedRes(offlineAnalyzed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const overallStatus: ServiceStatus = useMemo(() => {
    const statuses = [statsRes?.status, healthRes?.status, analyzedRes?.status].filter(Boolean) as ServiceStatus[];
    if (!statuses.length) return 'unknown';
    if (statuses.includes('offline')) return 'offline';
    if (statuses.includes('degraded')) return 'degraded';
    if (statuses.every((s) => s === 'online')) return 'online';
    return 'unknown';
  }, [statsRes, healthRes, analyzedRes]);

  const stats = statsRes?.data;
  const analyzed = Array.isArray(analyzedRes?.data) ? analyzedRes.data : [];
  const participation = stats && stats.total > 0 ? Math.round((stats.participated / stats.total) * 100) : null;
  const unanalyzedCount = stats ? Math.max(0, stats.total - stats.analyzed) : analyzed.filter((x) => !x.analysis).length;
  const urgentItems = analyzed
    .map((item) => ({ ...item, dday: daysLeft(item.deadline) }))
    .filter((item) => item.dday !== null && item.dday >= 0 && item.dday <= 2)
    .sort((a, b) => (a.dday ?? 999) - (b.dday ?? 999))
    .slice(0, 3);

  const isOnline = overallStatus === 'online' || overallStatus === 'degraded';
  const fetchedAt = statsRes?.fetchedAt || healthRes?.fetchedAt || analyzedRes?.fetchedAt;
  const statusError = statsRes?.error || healthRes?.error || analyzedRes?.error;

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Telegram 상태 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-6',
        isOnline
          ? 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
          : 'border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-950'
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Telegram 이벤트 봇</h2>
          <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', statusBadgeClass(overallStatus))}>
            {overallStatus}
          </span>
        </div>
        <button
          onClick={fetchAll}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {!isOnline ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <AlertTriangle className="h-4 w-4" />
            서버 오프라인
          </div>
          {statusError && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{statusError}</p>}
          {fetchedAt && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              마지막 확인: {new Date(fetchedAt).toLocaleString('ko-KR')}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">총 이벤트</p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{stats?.total ?? '--'}건</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">마감 임박</p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{urgentItems.length}건</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">참여율</p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                {participation === null ? '--' : `${participation}%`}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            미분석 이벤트: <span className="font-semibold">{unanalyzedCount}</span>건
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">마감 임박 이벤트</p>
            <div className="space-y-2">
              {urgentItems.length === 0 && (
                <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  현재 임박 이벤트 없음
                </p>
              )}
              {urgentItems.map((item) => (
                <div key={String(item.id)} className="rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    ⏰ {item.content || '이벤트'}{' '}
                  </span>
                  <span className="text-amber-600 dark:text-amber-300">D-{item.dday}</span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">예상보상: {inferReward(item.analysis)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
