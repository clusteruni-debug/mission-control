'use client';

import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  Clock,
  Search,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import {
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_STATUS_COLORS,
  INCIDENT_SOURCE_LABELS,
  INCIDENT_SOURCE_COLORS,
} from '@/lib/constants';
import type { Incident, IncidentStatus } from '@/types';

interface OperationCardProps {
  incident: Incident;
  onStatusChange: (id: number, status: IncidentStatus) => void;
  onDelete: (id: number) => void;
}

function formatAge(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}초`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}분 ${seconds % 60}초`;
}

const STATUS_ICON = {
  open: AlertTriangle,
  investigating: Search,
  resolved: CheckCircle,
} as const;

const SOURCE_ICON = {
  manual: User,
  'auto-recovery': Bot,
  'health-check': Zap,
} as const;

export function OperationCard({ incident, onStatusChange, onDelete }: OperationCardProps) {
  const Icon = STATUS_ICON[incident.status];
  const SourceIcon = SOURCE_ICON[incident.source] || User;
  const isResolved = incident.status === 'resolved';

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        isResolved
          ? 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50'
          : incident.severity === 'critical'
            ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
            : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20'
      )}
    >
      <div className="flex items-start gap-2">
        <Icon
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0',
            isResolved ? 'text-emerald-500' :
            incident.status === 'investigating' ? 'text-amber-500' : 'text-red-500'
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn('text-sm font-medium', isResolved ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100')}>
              {incident.title}
            </span>
            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', SEVERITY_COLORS[incident.severity])}>
              {SEVERITY_LABELS[incident.severity]}
            </span>
            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', INCIDENT_STATUS_COLORS[incident.status])}>
              {INCIDENT_STATUS_LABELS[incident.status]}
            </span>
            {/* Source badge */}
            <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium', INCIDENT_SOURCE_COLORS[incident.source])}>
              <SourceIcon className="h-2.5 w-2.5" />
              {INCIDENT_SOURCE_LABELS[incident.source]}
            </span>
          </div>

          {incident.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {incident.description}
            </p>
          )}

          {incident.action_taken && (
            <p className="mt-1 text-xs font-mono text-cyan-600 dark:text-cyan-400">
              → {incident.action_taken}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatAge(incident.detected_at)}
            </span>
            {incident.services_affected.length > 0 && (
              <span>영향: {incident.services_affected.join(', ')}</span>
            )}
            {incident.resolved_at && (
              <span className="text-emerald-500">해결: {formatAge(incident.resolved_at)}</span>
            )}
            {incident.recovery_duration_ms != null && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                <Zap className="h-2.5 w-2.5" />
                {formatDuration(incident.recovery_duration_ms)} 만에 복구
              </span>
            )}
            {incident.retry_count > 0 && (
              <span>재시도: {incident.retry_count}회</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-1">
          {incident.status === 'open' && (
            <button
              onClick={() => onStatusChange(incident.id, 'investigating')}
              className="rounded p-1 text-gray-400 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30"
              title="조사 시작"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          )}
          {incident.status !== 'resolved' && (
            <button
              onClick={() => onStatusChange(incident.id, 'resolved')}
              className="rounded p-1 text-gray-400 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30"
              title="해결 완료"
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
          )}
          {isResolved && (
            <button
              onClick={() => onDelete(incident.id)}
              className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
              title="삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
