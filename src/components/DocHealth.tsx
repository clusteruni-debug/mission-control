'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface DocHealthItem {
  name: string;
  status: 'ok' | 'warn' | 'critical';
  message: string;
  value?: number;
}

interface DocHealthData {
  items: DocHealthItem[];
  summary: { ok: number; warn: number; critical: number };
  scannedAt: string;
}

const STATUS_CONFIG = {
  ok: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
  warn: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
  critical: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
};

export function DocHealth() {
  const [data, setData] = useState<DocHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doc-health');
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error('Doc health fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">문서 상태 확인 중...</span>
      </div>
    );
  }

  if (!data) {
    return <p className="py-8 text-center text-gray-500">데이터를 불러올 수 없습니다.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex gap-4">
        {(['ok', 'warn', 'critical'] as const).map(status => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          const count = data.summary[status];
          return (
            <div key={status} className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${config.bg} ${config.border}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{count}</span>
              <span className="text-xs text-gray-500">{status === 'ok' ? '정상' : status === 'warn' ? '주의' : '위험'}</span>
            </div>
          );
        })}
        <button
          onClick={fetchData}
          className="ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" />
          새로고침
        </button>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
        {data.items.map((item, i) => {
          const config = STATUS_CONFIG[item.status];
          const Icon = config.icon;
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Icon className={`h-5 w-5 shrink-0 ${config.color}`} />
              <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{item.message}</span>
              {item.value !== undefined && (
                <span className="ml-auto font-mono text-xs text-gray-400">{item.value}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-right text-xs text-gray-400">
        마지막 확인: {new Date(data.scannedAt).toLocaleString('ko-KR')}
      </p>
    </div>
  );
}
