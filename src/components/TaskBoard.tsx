'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { PROJECTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Loader2,
  Search,
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  project: string;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<Task['status'], string> = {
  todo: '할 일',
  in_progress: '진행중',
  done: '완료',
};

const STATUS_COLORS: Record<Task['status'], string> = {
  todo: 'border-gray-300 dark:border-gray-600',
  in_progress: 'border-blue-400 dark:border-blue-600',
  done: 'border-emerald-400 dark:border-emerald-600',
};

const PRIORITY_BADGE: Record<Task['priority'], string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

const STATUS_ORDER: Task['status'][] = ['todo', 'in_progress', 'done'];
const NEXT_STATUS: Record<Task['status'], Task['status']> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

const PROJECT_NAMES = PROJECTS.map((p) => ({ folder: p.folder, name: p.name }));

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // New task form
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [adding, setAdding] = useState(false);

  // Expanded task
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // Editing description
  const [editingDesc, setEditingDesc] = useState<number | null>(null);
  const [descDraft, setDescDraft] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('작업 로딩 실패');
      const data = await res.json();
      setTasks(data.items || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '작업 로딩 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async () => {
    if (!title.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), project, priority }),
      });
      if (!res.ok) throw new Error('작업 추가 실패');
      const data = await res.json();
      setTasks((prev) => [data.item, ...prev]);
      setTitle('');
      setProject('');
      setPriority('medium');
      titleInputRef.current?.focus();
    } catch {
      // silent
    } finally {
      setAdding(false);
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    // optimistic
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!res.ok) throw new Error('update failed');
    } catch {
      fetchTasks();
    }
  };

  const deleteTask = async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
    } catch {
      fetchTasks();
    }
  };

  const startEditDesc = (task: Task) => {
    setEditingDesc(task.id);
    setDescDraft(task.description);
  };

  const saveDesc = (id: number) => {
    updateTask(id, { description: descDraft });
    setEditingDesc(null);
  };

  // Filter
  const needle = query.trim().toLowerCase();
  const filtered = tasks.filter((t) => {
    if (!needle) return true;
    return (
      t.title.toLowerCase().includes(needle) ||
      t.project.toLowerCase().includes(needle) ||
      t.description.toLowerCase().includes(needle)
    );
  });

  const grouped: Record<Task['status'], Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
  };
  for (const t of filtered) {
    const key = t.status in grouped ? t.status : 'todo';
    grouped[key as Task['status']].push(t);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">작업 보드 로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-500">{error}</p>
        <p className="text-xs text-gray-400">
          Supabase에 mc_tasks 테이블이 있는지 확인하세요.
          (supabase/migrations/003_mc_tasks.sql)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick add form */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="새 작업 제목..."
          className="min-w-[200px] flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
        />
        <input
          type="text"
          list="project-list"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="프로젝트 (선택/입력)"
          className="w-[160px] rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
        />
        <datalist id="project-list">
          {PROJECT_NAMES.map((p) => (
            <option key={p.folder} value={p.folder}>
              {p.name}
            </option>
          ))}
        </datalist>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task['priority'])}
          className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
        >
          <option value="high">높음</option>
          <option value="medium">보통</option>
          <option value="low">낮음</option>
        </select>
        <button
          type="button"
          onClick={addTask}
          disabled={adding || !title.trim()}
          className="inline-flex items-center gap-1 rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          추가
        </button>
      </div>

      {/* Search */}
      {tasks.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="작업 검색..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />
        </div>
      )}

      {/* Status groups */}
      {STATUS_ORDER.map((status) => (
        <section
          key={status}
          className={cn(
            'rounded-xl border-l-4 border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900',
            STATUS_COLORS[status]
          )}
        >
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {STATUS_LABELS[status]} ({grouped[status].length})
          </h3>
          <div className="space-y-2">
            {grouped[status].map((task) => {
              const isExpanded = expandedId === task.id;
              const projectName = PROJECT_NAMES.find(
                (p) => p.folder === task.project
              )?.name || task.project;

              return (
                <div
                  key={task.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : task.id)
                      }
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {task.title}
                    </span>

                    {projectName && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {projectName}
                      </span>
                    )}

                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-xs font-medium',
                        PRIORITY_BADGE[task.priority]
                      )}
                    >
                      {PRIORITY_LABELS[task.priority]}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateTask(task.id, {
                          status: NEXT_STATUS[task.status],
                        })
                      }
                      title={`→ ${STATUS_LABELS[NEXT_STATUS[task.status]]}`}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-200 px-3 py-2 dark:border-gray-700">
                      {editingDesc === task.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={descDraft}
                            onChange={(e) => setDescDraft(e.target.value)}
                            rows={3}
                            className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                            placeholder="설명 추가..."
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveDesc(task.id)}
                              className="rounded bg-gray-900 px-2 py-1 text-xs text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900"
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDesc(null)}
                              className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditDesc(task)}
                          className="w-full text-left text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          {task.description || '설명을 추가하려면 클릭...'}
                        </button>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(task.created_at).toLocaleDateString('ko-KR')} 생성
                      </p>
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
