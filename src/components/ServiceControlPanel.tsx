'use client';

import { useMemo, useState } from 'react';
import { KeyRound, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { usePm2Status, useServiceAction } from '@/hooks/useServiceControl';
import { getControlToken, setControlToken } from '@/lib/auth';
import { CATEGORY_ORDER, SERVICE_CATEGORY_LABELS } from '@/lib/constants';
import type { ServiceCategory } from '@/types';
import { ServiceCard } from './service-control/ServiceCard';

export function ServiceControlPanel() {
  const { services, loading, error, refresh } = usePm2Status();
  const { execute, isPending } = useServiceAction();
  const [tokenInput, setTokenInput] = useState('');
  const [hasToken, setHasToken] = useState(() => !!getControlToken());

  const grouped = useMemo(() => {
    const map = new Map<ServiceCategory, typeof services>();
    for (const cat of CATEGORY_ORDER) {
      map.set(cat, []);
    }
    for (const svc of services) {
      const list = map.get(svc.category);
      if (list) list.push(svc);
    }
    return map;
  }, [services]);

  const handleTokenSubmit = () => {
    const t = tokenInput.trim();
    if (!t) return;
    setControlToken(t);
    setHasToken(true);
    setTokenInput('');
  };

  // Auth gate
  if (!hasToken) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <KeyRound className="mb-4 h-8 w-8 text-gray-400" />
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          서비스 제어를 위해 인증 토큰을 입력하세요
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTokenSubmit()}
            placeholder="MC_CONTROL_SECRET"
            className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            onClick={handleTokenSubmit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            인증
          </button>
        </div>
      </div>
    );
  }

  // Localhost-only error
  if (error === 'localhost-only') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
        <WifiOff className="mb-3 h-8 w-8" />
        <p className="text-sm">서비스 제어는 로컬 환경에서만 사용 가능합니다.</p>
        <p className="mt-1 text-xs text-gray-400">Vercel 배포에서는 비활성화됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            서비스 ({services.length})
          </span>
          {error && (
            <span className="text-xs text-red-500">{error}</span>
          )}
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* Category groups */}
      {CATEGORY_ORDER.map((cat) => {
        const list = grouped.get(cat);
        if (!list || list.length === 0) return null;

        const onlineCount = list.filter(
          (s) => s.status === 'online' || s.status === 'active'
        ).length;

        return (
          <div key={cat}>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {SERVICE_CATEGORY_LABELS[cat]}
              </h3>
              <span className={`text-xs ${onlineCount === list.length ? 'text-emerald-500' : 'text-amber-500'}`}>
                {onlineCount}/{list.length} 활성
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((svc) => (
                <ServiceCard
                  key={svc.name}
                  service={svc}
                  onAction={execute}
                  isPending={isPending(svc.name)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
