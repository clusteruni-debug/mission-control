'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface BotTask {
  id: number;
  chat_id: number;
  command: string;
  result: string;
  timestamp: string;
}

interface ScheduledTask {
  id: number;
  chat_id: number;
  cron_expr: string;
  command: string;
  active: boolean;
}

interface BotHealthData {
  status: 'online' | 'offline';
  recent_tasks: BotTask[];
  success_rate: number;
  last_run: string | null;
  scheduled: ScheduledTask[];
  uptime: number;
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분`;
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}시간 ${m}분`;
  }
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  return `${d}일 ${h}시간`;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export function BotStatus() {
  const [data, setData] = useState<BotHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot-status');
      const json: BotHealthData = await res.json();
      setData(json);
    } catch {
      setData({
        status: 'offline',
        recent_tasks: [],
        success_rate: 0,
        last_run: null,
        scheduled: [],
        uptime: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">봇 상태 로딩 중...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isOnline = data.status === 'online';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            OpenClaw 봇 상태
          </h2>
          <span
            className={cn(
              'ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isOnline
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                isOnline ? 'bg-green-500' : 'bg-red-500'
              )}
            />
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <button
          onClick={fetchStatus}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {!isOnline ? (
        <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          봇이 실행되지 않고 있습니다. WSL에서 health_api.py를 실행하세요.
        </p>
      ) : (
        <div className="space-y-4">
          {/* 요약 통계 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Activity className="h-3.5 w-3.5" />
                성공률
              </div>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round(data.success_rate)}%
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                마지막 실행
              </div>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {data.last_run ? formatRelativeTime(data.last_run) : '-'}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                업타임
              </div>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatUptime(data.uptime)}
              </p>
            </div>
          </div>

          {/* 최근 작업 */}
          {data.recent_tasks.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                최근 작업
              </h3>
              <div className="space-y-1.5">
                {data.recent_tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800"
                  >
                    {task.result === 'success' ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                    )}
                    <span className="truncate text-gray-700 dark:text-gray-300">
                      {task.command}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-gray-400">
                      {formatRelativeTime(task.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 스케줄된 작업 */}
          {data.scheduled.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                스케줄 작업
              </h3>
              <div className="space-y-1.5">
                {data.scheduled.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800"
                  >
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        s.active ? 'bg-green-500' : 'bg-gray-400'
                      )}
                    />
                    <span className="truncate text-gray-700 dark:text-gray-300">
                      {s.command}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-xs text-gray-400">
                      {s.cron_expr}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
