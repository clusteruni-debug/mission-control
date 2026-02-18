'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TaskBoardItem } from '@/types';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';

interface ApiResponse {
  items: TaskBoardItem[];
  total?: number;
  statusCounts?: Record<string, number>;
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'claude-code' | 'codex'>('all');

  const load = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/task-board', { cache: 'no-store' });
      if (!res.ok) throw new Error('작업 보드 로딩 실패');
      const data: ApiResponse = await res.json();
      setItems(data.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '작업 보드 로딩 실패');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load(false);
  }, []);

  const grouped = useMemo(() => {
    const m: Record<string, TaskBoardItem[]> = {};
    for (const key of STATUS_GROUPS) m[key] = [];
    const needle = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (ownerFilter !== 'all' && item.owner !== ownerFilter) return false;
      if (!needle) return true;
      return (
        item.taskId.toLowerCase().includes(needle) ||
        item.project.toLowerCase().includes(needle) ||
        item.scopeFiles.toLowerCase().includes(needle) ||
        item.notes.toLowerCase().includes(needle)
      );
    });

    for (const item of filtered) {
      const key = item.status in m ? item.status : 'todo';
      m[key].push(item);
    }
    return m;
  }, [items, query, ownerFilter]);

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
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="TASK-ID / 프로젝트 / 파일 검색"
          className="min-w-[260px] flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
        />
        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value as 'all' | 'claude-code' | 'codex')}
          className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
        >
          <option value="all">전체 에이전트</option>
          <option value="claude-code">claude-code</option>
          <option value="codex">codex</option>
        </select>
        <button
          type="button"
          onClick={() => load(true)}
          className="inline-flex items-center gap-1 rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

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
