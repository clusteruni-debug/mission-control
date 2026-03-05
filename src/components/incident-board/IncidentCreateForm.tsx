'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SERVICE_REGISTRY } from '@/lib/constants';
import type { IncidentSeverity } from '@/types';

interface IncidentCreateFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    severity: IncidentSeverity;
    services_affected?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
}

export function IncidentCreateForm({ onSubmit }: IncidentCreateFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await onSubmit({
      title,
      description: description || undefined,
      severity,
      services_affected: selectedServices.length > 0 ? selectedServices : undefined,
    });
    setSubmitting(false);
    if (result.success) {
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setSelectedServices([]);
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
        인시던트 등록
      </button>
    );
  }

  const toggleService = (name: string) => {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">새 인시던트</span>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="인시던트 제목"
        className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="설명 (선택)"
        rows={2}
        className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
      />

      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs text-gray-500">심각도:</span>
        {(['critical', 'high', 'medium', 'low'] as IncidentSeverity[]).map((s) => (
          <button
            key={s}
            onClick={() => setSeverity(s)}
            className={`rounded px-2 py-0.5 text-xs ${
              severity === s
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mb-2">
        <span className="text-xs text-gray-500">영향 서비스:</span>
        <div className="mt-1 flex flex-wrap gap-1">
          {SERVICE_REGISTRY.filter((s) => s.category === 'always-on' || s.category === 'wsl').map((svc) => (
            <button
              key={svc.name}
              onClick={() => toggleService(svc.name)}
              className={`rounded px-1.5 py-0.5 text-[10px] ${
                selectedServices.includes(svc.name)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {svc.name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!title.trim() || submitting}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {submitting ? '등록 중...' : '인시던트 등록'}
      </button>
    </div>
  );
}
