'use client';

import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Clock,
  Play,
  Trash2,
  XCircle,
  AlertTriangle,
  Hammer,
  FileSearch,
  Lightbulb,
} from 'lucide-react';
import {
  AGENT_PHASE_LABELS,
  AGENT_PHASE_COLORS,
  AGENT_PRIORITY_LABELS,
} from '@/lib/constants';
import type { AgentTask, AgentTaskPhase } from '@/types';

interface AgentTaskCardProps {
  task: AgentTask;
  onPhaseChange: (id: string, phase: AgentTaskPhase) => void;
  onDelete: (id: string) => void;
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

const PHASE_ICON: Record<AgentTaskPhase, typeof Clock> = {
  proposed: Lightbulb,
  pending: Clock,
  plan: FileSearch,
  build: Hammer,
  review: FileSearch,
  done: CheckCircle,
  failed: XCircle,
  escalated: AlertTriangle,
};

const NEXT_PHASE: Partial<Record<AgentTaskPhase, AgentTaskPhase>> = {
  proposed: 'pending',
  pending: 'plan',
  plan: 'build',
  build: 'review',
  review: 'done',
};

export function AgentTaskCard({ task, onPhaseChange, onDelete }: AgentTaskCardProps) {
  const Icon = PHASE_ICON[task.phase];
  const isDone = task.phase === 'done';
  const isFailed = task.phase === 'failed' || task.phase === 'escalated';
  const nextPhase = NEXT_PHASE[task.phase];

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        isDone
          ? 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50'
          : isFailed
            ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      )}
    >
      <div className="flex items-start gap-2">
        <Icon
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0',
            isDone ? 'text-emerald-500' :
            isFailed ? 'text-red-500' :
            task.phase === 'build' ? 'text-cyan-500' :
            task.phase === 'review' ? 'text-amber-500' :
            'text-gray-400'
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', isDone ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100')}>
              {task.title}
            </span>
            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', AGENT_PHASE_COLORS[task.phase])}>
              {AGENT_PHASE_LABELS[task.phase]}
            </span>
            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              P{task.priority} {AGENT_PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-gray-400">
            <span className="rounded bg-gray-100 px-1 dark:bg-gray-700">{task.project}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatAge(task.created_at)}
            </span>
            {task.source !== 'manual' && (
              <span className="italic">{task.source}</span>
            )}
            {task.agent && <span>agent: {task.agent}</span>}
            {task.result_summary && (
              <span className="text-emerald-500">{task.result_summary}</span>
            )}
            {task.error && (
              <span className="text-red-500 line-clamp-1">{task.error}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-1">
          {nextPhase && (
            <button
              onClick={() => onPhaseChange(task.id, nextPhase)}
              className="rounded p-1 text-gray-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30"
              title={`→ ${AGENT_PHASE_LABELS[nextPhase]}`}
            >
              <Play className="h-3.5 w-3.5" />
            </button>
          )}
          {isFailed && (
            <button
              onClick={() => onPhaseChange(task.id, 'pending')}
              className="rounded p-1 text-gray-400 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30"
              title="재시도 (pending으로)"
            >
              <Play className="h-3.5 w-3.5" />
            </button>
          )}
          {!isDone && (
            <button
              onClick={() => onPhaseChange(task.id, 'failed')}
              className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
              title="실패 처리"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          )}
          {(isDone || isFailed) && (
            <button
              onClick={() => onDelete(task.id)}
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
