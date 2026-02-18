'use client';

import { useEffect, useMemo, useState } from 'react';
import { PROJECTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ArrowRight, Link2 } from 'lucide-react';
import type { ServiceStatus } from '@/types/status';
import { getStatusColor } from '@/types/status';

interface Connection {
  from: string;
  to: string;
  fromName: string;
  toName: string;
  status: ServiceStatus;
  fetchedAt: string | null;
  error?: string;
}

interface HealthSnapshot {
  status: ServiceStatus;
  fetchedAt: string | null;
  error?: string;
}

const SERVICE_BY_FOLDER: Record<string, string> = {
  'make-money-project': 'make-money',
  'telegram-event-bot': 'telegram-bot',
  'claude-code-bot': 'openclaw',
};

function statusWeight(status: ServiceStatus): number {
  if (status === 'offline') return 3;
  if (status === 'degraded') return 2;
  if (status === 'online') return 1;
  return 0;
}

function pickConnectionStatus(
  a?: HealthSnapshot,
  b?: HealthSnapshot
): ServiceStatus {
  const candidates = [a?.status, b?.status].filter(Boolean) as ServiceStatus[];
  if (!candidates.length) return 'unknown';
  return [...candidates].sort(
    (left, right) => statusWeight(right) - statusWeight(left)
  )[0];
}

export function ConnectionMap() {
  const [serviceHealth, setServiceHealth] = useState<
    Record<string, HealthSnapshot>
  >({});

  useEffect(() => {
    const fetchHealth = async () => {
      const requests = await Promise.allSettled([
        fetch('/api/make-money?path=health').then((r) => r.json()),
        fetch('/api/telegram-bot?path=health').then((r) => r.json()),
        fetch('/api/bot-status').then((r) => r.json()),
      ]);

      const toSnapshot = (payload: unknown): HealthSnapshot => {
        if (!payload || typeof payload !== 'object') {
          return {
            status: 'offline',
            fetchedAt: new Date().toISOString(),
            error: '응답 파싱 실패',
          };
        }

        const data = payload as {
          status?: string;
          fetchedAt?: string;
          error?: string;
        };

        const rawStatus = data.status;
        const status: ServiceStatus =
          rawStatus === 'online' ||
          rawStatus === 'degraded' ||
          rawStatus === 'offline' ||
          rawStatus === 'unknown'
            ? rawStatus
            : rawStatus === 'active'
              ? 'online'
              : 'unknown';

        return {
          status,
          fetchedAt: data.fetchedAt || new Date().toISOString(),
          error: data.error,
        };
      };

      setServiceHealth({
        'make-money': requests[0].status === 'fulfilled'
          ? toSnapshot(requests[0].value)
          : {
              status: 'offline',
              fetchedAt: new Date().toISOString(),
              error: 'Make Money 연결 실패',
            },
        'telegram-bot': requests[1].status === 'fulfilled'
          ? toSnapshot(requests[1].value)
          : {
              status: 'offline',
              fetchedAt: new Date().toISOString(),
              error: 'Telegram Bot 연결 실패',
            },
        openclaw: requests[2].status === 'fulfilled'
          ? toSnapshot(requests[2].value)
          : {
              status: 'offline',
              fetchedAt: new Date().toISOString(),
              error: 'OpenClaw 연결 실패',
            },
      });
    };

    fetchHealth();
  }, []);

  const connections = useMemo(() => {
    const items: Connection[] = [];
    const seen = new Set<string>();

    for (const project of PROJECTS) {
      if (!project.connections) continue;
      for (const targetFolder of project.connections) {
        const key = [project.folder, targetFolder].sort().join('↔');
        if (seen.has(key)) continue;
        seen.add(key);

        const target = PROJECTS.find((p) => p.folder === targetFolder);
        if (!target) continue;

        const serviceA = SERVICE_BY_FOLDER[project.folder];
        const serviceB = SERVICE_BY_FOLDER[targetFolder];
        const healthA = serviceA ? serviceHealth[serviceA] : undefined;
        const healthB = serviceB ? serviceHealth[serviceB] : undefined;
        const status = pickConnectionStatus(healthA, healthB);

        const fetchedAt = healthA?.fetchedAt || healthB?.fetchedAt || null;
        const error = healthA?.error || healthB?.error;

        items.push({
          from: project.folder,
          to: targetFolder,
          fromName: project.name,
          toName: target.name,
          status,
          fetchedAt,
          error,
        });
      }
    }

    return items;
  }, [serviceHealth]);

  if (connections.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">
        프로젝트 간 연동이 없습니다
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {connections.map((conn) => (
        <div
          key={`${conn.from}-${conn.to}`}
          title={
            conn.fetchedAt
              ? `updated: ${new Date(conn.fetchedAt).toLocaleString('ko-KR')}${conn.error ? ` | ${conn.error}` : ''}`
              : 'updated: -'
          }
          className={cn(
            'flex items-center gap-3 rounded-lg border px-4 py-3',
            conn.status === 'online' &&
              'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20',
            conn.status === 'degraded' &&
              'border-amber-300 border-dashed bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20',
            conn.status === 'offline' &&
              'border-red-300 border-dashed bg-red-50 dark:border-red-900 dark:bg-red-950/20',
            conn.status === 'unknown' &&
              'border-gray-200 border-dashed bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
          )}
        >
          <Link2
            className={cn(
              'h-4 w-4 flex-shrink-0',
              getStatusColor(conn.status) === 'emerald' &&
                'text-emerald-500',
              getStatusColor(conn.status) === 'amber' && 'text-amber-500',
              getStatusColor(conn.status) === 'red' && 'text-red-500',
              getStatusColor(conn.status) === 'gray' && 'text-gray-500'
            )}
          />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {conn.fromName}
          </span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {conn.toName}
          </span>
          <span
            className={cn(
              'ml-auto rounded-full px-2 py-0.5 text-xs font-medium',
              conn.status === 'online' &&
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
              conn.status === 'degraded' &&
                'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
              conn.status === 'offline' &&
                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
              conn.status === 'unknown' &&
                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            )}
          >
            {conn.status}
          </span>
        </div>
      ))}
    </div>
  );
}
