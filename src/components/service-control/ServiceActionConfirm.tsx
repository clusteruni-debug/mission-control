'use client';

import { AlertTriangle } from 'lucide-react';
import type { ServiceAction } from '@/types';

interface ServiceActionConfirmProps {
  serviceName: string;
  action: ServiceAction;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ServiceActionConfirm({
  serviceName,
  action,
  onConfirm,
  onCancel,
}: ServiceActionConfirmProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-red-300 bg-white p-6 shadow-2xl dark:border-red-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              보호된 서비스
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {serviceName}
            </p>
          </div>
        </div>
        <p className="mb-5 text-sm text-gray-700 dark:text-gray-300">
          <strong>{serviceName}</strong>에 대해 <strong>{action}</strong> 작업을 실행하시겠습니까?
          이 서비스는 실시간 운영 중입니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            확인 — {action}
          </button>
        </div>
      </div>
    </div>
  );
}
