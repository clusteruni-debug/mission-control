'use client';

import { useState } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Lock,
  Server,
  Terminal,
} from 'lucide-react';
import type { Pm2ServiceInfo, ServiceAction } from '@/types';
import { ServiceLogViewer } from './ServiceLogViewer';
import { ServiceActionConfirm } from './ServiceActionConfirm';

interface ServiceCardProps {
  service: Pm2ServiceInfo;
  onAction: (name: string, action: ServiceAction, confirm?: boolean) => Promise<{ success: boolean; error?: string }>;
  isPending: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  online: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  stopped: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  not_registered: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  errored: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  launching: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  stopping: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  unknown: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  online: '온라인',
  active: '활성',
  stopped: '중지됨',
  inactive: '비활성',
  not_registered: '미등록',
  errored: '오류',
  failed: '실패',
  launching: '시작 중',
  stopping: '중지 중',
  unknown: '알 수 없음',
};

function formatUptime(ms: number | null): string {
  if (!ms) return '-';
  const diff = Date.now() - ms;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatMemory(bytes: number | null): string {
  if (bytes === null) return '-';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function isRunning(status: string): boolean {
  return status === 'online' || status === 'active' || status === 'launching';
}

export function ServiceCard({ service, onAction, isPending }: ServiceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ServiceAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const running = isRunning(service.status);

  const handleAction = async (action: ServiceAction) => {
    if (service.protected && (action === 'stop' || action === 'restart')) {
      setConfirmAction(action);
      return;
    }
    setActionError(null);
    const result = await onAction(service.name, action);
    if (!result.success) setActionError(result.error || 'Failed');
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setActionError(null);
    const result = await onAction(service.name, confirmAction, true);
    if (!result.success) setActionError(result.error || 'Failed');
    setConfirmAction(null);
  };

  return (
    <>
      <div
        className={`rounded-lg border p-4 transition-colors ${
          service.protected
            ? 'border-red-200 dark:border-red-900'
            : 'border-gray-200 dark:border-gray-800'
        } bg-white dark:bg-gray-900`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {service.protected && <Lock className="h-3.5 w-3.5 text-red-500" />}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {service.name}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[service.status] || STATUS_STYLES.unknown}`}>
              {STATUS_LABELS[service.status] || service.status}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              {service.runtime === 'wsl-systemd' ? (
                <Terminal className="h-3 w-3" />
              ) : (
                <Server className="h-3 w-3" />
              )}
              {service.runtime === 'wsl-systemd' ? 'systemd' : 'pm2'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {!running && (
              <button
                onClick={() => handleAction('start')}
                disabled={isPending}
                className="rounded p-1.5 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-40 dark:hover:bg-emerald-900/30"
                title="시작"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
            )}
            {running && (
              <button
                onClick={() => handleAction('stop')}
                disabled={isPending}
                className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/30"
                title="중지"
              >
                <Square className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => handleAction('restart')}
              disabled={isPending || !running}
              className="rounded p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 dark:hover:bg-blue-900/30"
              title="재시작"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          {service.port && <span>:{service.port}</span>}
          <span>CPU: {service.cpu !== null ? `${service.cpu}%` : '-'}</span>
          <span>MEM: {formatMemory(service.memory)}</span>
          <span>업타임: {formatUptime(service.uptime)}</span>
          {service.restarts > 0 && (
            <span className="text-amber-500">재시작: {service.restarts}</span>
          )}
        </div>

        {/* Error */}
        {actionError && (
          <p className="mt-2 text-xs text-red-500">{actionError}</p>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? '로그 닫기' : '로그 보기'}
        </button>

        {expanded && <ServiceLogViewer name={service.name} />}
      </div>

      {confirmAction && (
        <ServiceActionConfirm
          serviceName={service.name}
          action={confirmAction}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
}
