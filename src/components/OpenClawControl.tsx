'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ServiceStatus, ProxyResponse } from '@/types/status';
import {
  Bot,
  Play,
  CheckCircle,
  XCircle,
  MinusCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

// --- OpenClaw API 응답 타입 ---

interface ClawStatus {
  bot_status: string;
  current_task: {
    task_id: string;
    project: string;
    task: string;
    engine: string;
    started_at: string;
    status: string;
  } | null;
}

interface ClawProject {
  name: string;
  path: string;
  description: string;
}

interface ClawQueueItem {
  task_id: string;
  project: string;
  task: string;
}

interface ClawHistoryItem {
  task_id: string;
  project: string;
  task: string;
  status: string;
  duration: number;
  tokens_in: number;
  tokens_out: number;
  completed_at: string;
}

// --- 헬퍼 ---

const ENGINES = [
  { value: 'autopilot', label: 'Autopilot' },
  { value: 'claude', label: 'Claude Code' },
  { value: 'codex', label: 'Codex' },
];

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}분 ${s}초`;
  const h = Math.floor(m / 60);
  return `${h}시간 ${m % 60}분`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;
  return `${Math.floor(seconds / 60)}분`;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

async function fetchClaw<T>(path: string): Promise<ProxyResponse<T>> {
  try {
    const res = await fetch(`/api/openclaw-command?path=${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      data: null,
      status: 'offline' as ServiceStatus,
      fetchedAt: new Date().toISOString(),
      error: 'OpenClaw API 연결 실패',
    };
  }
}

async function postClaw(action: string, body: object) {
  try {
    const res = await fetch(`/api/openclaw-command?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

// --- 컴포넌트 ---

export function OpenClawControl() {
  const [statusRes, setStatusRes] = useState<ProxyResponse<ClawStatus> | null>(
    null
  );
  const [projects, setProjects] = useState<ClawProject[]>([]);
  const [queue, setQueue] = useState<ClawQueueItem[]>([]);
  const [history, setHistory] = useState<ClawHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 커맨드 폼
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('autopilot');
  const [taskInput, setTaskInput] = useState('');
  const [executing, setExecuting] = useState(false);

  // 경과 시간 타이머
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    const [sRes, pRes, qRes, hRes] = await Promise.all([
      fetchClaw<ClawStatus>('status'),
      fetchClaw<{ projects: ClawProject[] }>('projects'),
      fetchClaw<{ queue: ClawQueueItem[] }>('queue'),
      fetchClaw<{ tasks: ClawHistoryItem[] }>('history'),
    ]);
    setStatusRes(sRes);
    if (pRes.data?.projects) setProjects(pRes.data.projects);
    if (qRes.data?.queue) setQueue(qRes.data.queue);
    if (hRes.data?.tasks) setHistory(hRes.data.tasks);
    setLoading(false);
  }, []);

  const fetchStatus = useCallback(async () => {
    const [sRes, qRes] = await Promise.all([
      fetchClaw<ClawStatus>('status'),
      fetchClaw<{ queue: ClawQueueItem[] }>('queue'),
    ]);
    setStatusRes(sRes);
    if (qRes.data?.queue) setQueue(qRes.data.queue);
  }, []);

  // 초기 로딩
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // 작업 실행 중 3초 폴링
  useEffect(() => {
    if (statusRes?.data?.current_task) {
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [statusRes?.data?.current_task, fetchStatus]);

  // 경과 시간 실시간 업데이트
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (statusRes?.data?.current_task?.started_at) {
      const start = new Date(
        statusRes.data.current_task.started_at
      ).getTime();
      const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [statusRes?.data?.current_task?.started_at]);

  const handleExecute = async () => {
    if (!selectedProject || !taskInput.trim()) return;

    const confirmed = window.confirm(
      `'${selectedProject}'에서 '${taskInput.trim()}'를 실행합니다.`
    );
    if (!confirmed) return;

    setExecuting(true);
    await postClaw('command', {
      project: selectedProject,
      task: taskInput.trim(),
      engine: selectedEngine,
    });
    setTaskInput('');
    setExecuting(false);
    fetchStatus();
  };

  const handleCancel = async () => {
    const confirmed = window.confirm('현재 작업을 취소하시겠습니까?');
    if (!confirmed) return;
    await postClaw('cancel', {});
    fetchStatus();
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">
            OpenClaw 상태 로딩 중...
          </span>
        </div>
      </div>
    );
  }

  const isOnline =
    statusRes?.status === 'online' || statusRes?.status === 'degraded';
  const currentTask = statusRes?.data?.current_task;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              OpenClaw 컨트롤
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
            onClick={() => {
              setLoading(true);
              fetchAll();
            }}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {!isOnline ? (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              OpenClaw 오프라인 — 실행/취소 비활성화
            </p>
            {statusRes?.error && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {statusRes.error}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 커맨드 입력 */}
            <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="relative">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">프로젝트 선택...</option>
                    {projects.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <div className="relative">
                  <select
                    value={selectedEngine}
                    onChange={(e) => setSelectedEngine(e.target.value)}
                    className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    {ENGINES.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
                  placeholder="작업 내용을 입력하세요..."
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                />
                <button
                  onClick={handleExecute}
                  disabled={
                    !selectedProject || !taskInput.trim() || executing
                  }
                  className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
                >
                  {executing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  실행
                </button>
              </div>
            </div>

            {/* 현재 작업 */}
            {currentTask && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  현재 작업
                </h3>
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {currentTask.project} &mdash; &ldquo;
                      {currentTask.task}&rdquo;
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentTask.engine} &middot;{' '}
                      {formatElapsed(elapsed)} 경과
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 큐 */}
            {queue.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  큐 ({queue.length}개)
                </h3>
                <div className="space-y-1.5">
                  {queue.map((item, i) => (
                    <div
                      key={item.task_id}
                      className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800"
                    >
                      <span className="shrink-0 text-xs font-medium text-gray-400">
                        {i + 1}.
                      </span>
                      <span className="truncate text-gray-700 dark:text-gray-300">
                        {item.project} &mdash; &ldquo;{item.task}&rdquo;
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 히스토리 */}
            {history.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  최근 히스토리
                </h3>
                <div className="space-y-1.5">
                  {history.slice(0, 10).map((item) => (
                    <div
                      key={item.task_id}
                      className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800"
                    >
                      {item.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : item.status === 'failed' ? (
                        <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                      ) : (
                        <MinusCircle className="h-4 w-4 shrink-0 text-gray-400" />
                      )}
                      <span className="truncate text-gray-700 dark:text-gray-300">
                        {item.project} &mdash; &ldquo;{item.task}&rdquo;
                      </span>
                      <span className="ml-auto flex shrink-0 items-center gap-2 text-xs text-gray-400">
                        <span>{formatDuration(item.duration)}</span>
                        <span>
                          {formatTokens(item.tokens_in)}/
                          {formatTokens(item.tokens_out)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
