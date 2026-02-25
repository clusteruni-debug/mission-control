'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ServiceStatus, ProxyResponse } from '@/types/status';
import { DollarSign, RefreshCw, Loader2 } from 'lucide-react';
import { PortfolioSummary } from './make-money/PortfolioSummary';
import { EngineStatusList } from './make-money/EngineStatusList';
import { RecentTrades } from './make-money/RecentTrades';
import type { RawHealth, RawPortfolio, RawEngine, RawTrade } from './make-money/types';

export function MakeMoneyWidget() {
  const [health, setHealth] = useState<ProxyResponse<RawHealth> | null>(null);
  const [portfolio, setPortfolio] = useState<ProxyResponse<RawPortfolio> | null>(null);
  const [engines, setEngines] = useState<ProxyResponse<RawEngine[]> | null>(null);
  const [trades, setTrades] = useState<ProxyResponse<RawTrade[]> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [hRes, pRes, eRes, tRes] = await Promise.all([
        fetch('/api/make-money?path=health').then((r) => r.json()),
        fetch('/api/make-money?path=portfolio').then((r) => r.json()),
        fetch('/api/make-money?path=engines').then((r) => r.json()),
        fetch('/api/make-money?path=trades').then((r) => r.json()),
      ]);
      setHealth(hRes);
      setPortfolio(pRes);
      setEngines(eRes);
      setTrades(tRes);
    } catch {
      const offline = {
        data: null,
        status: 'offline' as ServiceStatus,
        fetchedAt: new Date().toISOString(),
        error: 'Mission Control 프록시 연결 실패',
      };
      setHealth(offline);
      setPortfolio(offline);
      setEngines(offline);
      setTrades(offline);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">
            Make Money 상태 로딩 중...
          </span>
        </div>
      </div>
    );
  }

  const overallStatus: ServiceStatus = health?.status ?? 'unknown';
  const isOnline = overallStatus === 'online' || overallStatus === 'degraded';
  const agentState = health?.data?.agent ?? 'unknown';
  const fetchedAt = health?.fetchedAt ?? portfolio?.fetchedAt;

  return (
    <div
      className={cn(
        'rounded-xl border p-6',
        isOnline
          ? 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
          : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'
      )}
    >
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Make Money 에이전트
          </h2>
          <span
            className={cn(
              'ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isOnline
                ? agentState === 'running'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                isOnline
                  ? agentState === 'running'
                    ? 'bg-green-500'
                    : 'bg-amber-500'
                  : 'bg-red-500'
              )}
            />
            {isOnline
              ? agentState === 'running'
                ? 'Running'
                : agentState
              : 'Offline'}
          </span>
        </div>
        <button
          onClick={fetchAll}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {!isOnline ? (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            서버 오프라인
          </p>
          {health?.error && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {health.error}
            </p>
          )}
          {fetchedAt && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              마지막 확인: {new Date(fetchedAt).toLocaleString('ko-KR')}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {portfolio?.data && <PortfolioSummary portfolio={portfolio.data} />}
          {engines?.data && <EngineStatusList engines={engines.data} />}
          {trades?.data && <RecentTrades trades={trades.data} />}
        </div>
      )}
    </div>
  );
}
