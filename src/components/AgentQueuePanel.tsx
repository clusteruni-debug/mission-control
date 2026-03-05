'use client';

import { useState } from 'react';
import { AlertTriangle, Bot, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useAgentQueue } from '@/hooks/useAgentQueue';
import { AgentTaskCard } from './agent-queue/AgentTaskCard';
import { AgentTaskCreateForm } from './agent-queue/AgentTaskCreateForm';

export function AgentQueuePanel() {
  const {
    tasks,
    loading,
    tableReady,
    activeCount,
    refresh,
    createTask,
    updateTask,
    deleteTask,
  } = useAgentQueue();
  const [showCompleted, setShowCompleted] = useState(false);

  if (!tableReady) {
    return (
      <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-950/20">
        <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-amber-500" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          mc_agent_tasks 테이블이 아직 생성되지 않았습니다.
        </p>
        <p className="mt-1 text-xs text-amber-500">
          supabase/migrations/20260306_mc_agent_tasks.sql을 실행해주세요.
        </p>
      </div>
    );
  }

  const activeTasks = tasks.filter(
    (t) => !['done', 'failed', 'escalated'].includes(t.phase)
  );
  const completedTasks = tasks.filter(
    (t) => ['done', 'failed', 'escalated'].includes(t.phase)
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className={`h-4 w-4 ${activeCount > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            에이전트 큐
          </span>
          {activeCount > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {activeCount} 활성
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <AgentTaskCreateForm onSubmit={createTask} />
          <button
            onClick={refresh}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active tasks */}
      {activeTasks.length === 0 && !loading && (
        <p className="py-4 text-center text-xs text-gray-400">활성 태스크 없음</p>
      )}
      {activeTasks.map((task) => (
        <AgentTaskCard
          key={task.id}
          task={task}
          onPhaseChange={(id, phase) => updateTask(id, { phase })}
          onDelete={deleteTask}
        />
      ))}

      {/* Completed toggle */}
      {completedTasks.length > 0 && (
        <>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showCompleted ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            완료/실패 태스크 ({completedTasks.length})
          </button>
          {showCompleted &&
            completedTasks.map((task) => (
              <AgentTaskCard
                key={task.id}
                task={task}
                onPhaseChange={(id, phase) => updateTask(id, { phase })}
                onDelete={deleteTask}
              />
            ))}
        </>
      )}
    </div>
  );
}
