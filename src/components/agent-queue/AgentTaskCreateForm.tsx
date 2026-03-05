'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PROJECTS } from '@/lib/constants';
import type { AgentTaskSource } from '@/types';

interface AgentTaskCreateFormProps {
  onSubmit: (data: {
    title: string;
    project: string;
    description?: string;
    priority?: number;
    source?: AgentTaskSource;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function AgentTaskCreateForm({ onSubmit }: AgentTaskCreateFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !project.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await onSubmit({
      title,
      project,
      description: description || undefined,
      priority,
      source: 'manual',
    });
    setSubmitting(false);
    if (result.success) {
      setTitle('');
      setProject('');
      setDescription('');
      setPriority(2);
      setOpen(false);
    } else {
      setError(result.error || 'Failed');
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Plus className="h-3.5 w-3.5" />
        태스크 등록
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">새 에이전트 태스크</span>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="태스크 제목"
        className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
      />

      <div className="mb-2">
        <input
          type="text"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          list="agent-project-list"
          placeholder="프로젝트"
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
        <datalist id="agent-project-list">
          {PROJECTS.map((p) => (
            <option key={p.folder} value={p.folder} />
          ))}
        </datalist>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="설명 (선택)"
        rows={2}
        className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
      />

      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs text-gray-500">우선순위:</span>
        {[1, 2, 3].map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={`rounded px-2 py-0.5 text-xs ${
              priority === p
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            P{p} {p === 1 ? '높음' : p === 2 ? '보통' : '낮음'}
          </button>
        ))}
      </div>

      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!title.trim() || !project.trim() || submitting}
        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? '등록 중...' : '태스크 등록'}
      </button>
    </div>
  );
}
