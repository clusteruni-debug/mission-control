'use client';

import { RefreshCw, Loader2 } from 'lucide-react';

interface DashboardHeaderProps {
  scannedAt: string | null;
  countdown: number;
  loading: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({ scannedAt, countdown, loading, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Mission Control
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          워크스페이스 프로젝트 관제 대시보드
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {scannedAt && `${new Date(scannedAt).toLocaleTimeString('ko-KR')} 스캔`}
          {scannedAt && ' · '}
          {countdown}s
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          스캔
        </button>
      </div>
    </div>
  );
}
