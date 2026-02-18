'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TaskBoardItem } from '@/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ApiResponse {
  items: TaskBoardItem[];
}

const STATUS_GROUPS = ['in_progress', 'todo', 'done'] as const;

const OWNER_COLOR: Record<string, string> = {
  'claude-code': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  codex: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export function TaskBoard() {
  const [items, setItems] = useState<TaskBoardItem[]>([]);
  const [openSet, setOpenSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/task-board');
        if (!res.ok) throw new Error('작업 보드 로딩 실패');
        const data: ApiResponse = await res.json();
        setItems(data.items || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : '작업 보드 로딩 실패');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const m: Record<string, TaskBoardItem[]> = {};
    for (const key of STATUS_GROUPS) m[key] = [];
    for (const item of items) {
      const key = item.status in m ? item.status : 'todo';
      m[key].push(item);
    }
    return m;
  }, [items]);

  const toggle = (taskId: string) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  if (loading) return <p className="text-sm text-gray-500">작업 보드를 불러오는 중...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {STATUS_GROUPS.map((status) => (
        <section
          key={status}
          className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {status} ({grouped[status].length})
          </h3>
          <div className="space-y-2">
            {grouped[status].map((item) => {
              const isOpen = openSet.has(item.taskId);
              const ownerClass = OWNER_COLOR[item.owner] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
              return (
                <div key={item.taskId} className="rounded-lg border border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => toggle(item.taskId)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{item.taskId}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.project}</span>
                    <span className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${ownerClass}`}>{item.owner}</span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-200 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
                      <p>
                        <span className="font-medium">scope:</span> {item.scopeFiles}
                      </p>
                      {item.notes && (
                        <p className="mt-1">
                          <span className="font-medium">notes:</span> {item.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {grouped[status].length === 0 && (
              <p className="text-sm text-gray-400">해당 상태 작업이 없습니다.</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
