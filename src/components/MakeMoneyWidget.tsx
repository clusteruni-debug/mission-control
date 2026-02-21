'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ServiceStatus, ProxyResponse } from '@/types/status';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Zap,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

// Make Money 서버 실제 응답 형식에 맞춤

interface RawHealth {
  status: string;
  uptime: number;
  agent: string;
}

interface RawPortfolio {
  balance: number;
  totalPnL: number;
  openPositions: number;
  winRate: number;
}

interface RawEngine {
  id: string;
  name: string;
  enabled: boolean;
  lastRun: number | null;
}

interface RawTrade {
  id: string;
  symbol: string;
  status: string;
  filled_cost: number;
  exit_proceeds: number | null;
  entry_timestamp: number;
  close_reason: string | null;
}

function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toFixed(2)}`;
}

function formatPnL(amount: number): string {
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

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
          {/* 포트폴리오 요약 */}
          {portfolio?.data && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <DollarSign className="h-3.5 w-3.5" />
                  잔고
                </div>
                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(portfolio.data.balance)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {portfolio.data.totalPnL >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  총 P&L
                </div>
                <p
                  className={cn(
                    'mt-1 text-xl font-bold',
                    portfolio.data.totalPnL >= 0
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  )}
                >
                  {formatPnL(portfolio.data.totalPnL)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Zap className="h-3.5 w-3.5" />
                  승률
                </div>
                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(portfolio.data.winRate * 100)}%
                </p>
              </div>
            </div>
          )}

          {/* 엔진 상태 */}
          {engines?.data && engines.data.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                엔진 상태
              </h3>
              <div className="flex flex-wrap gap-2">
                {engines.data.map((engine) => (
                  <span
                    key={engine.id}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                      engine.enabled
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        engine.enabled ? 'bg-emerald-500' : 'bg-gray-400'
                      )}
                    />
                    {engine.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 최근 거래 */}
          {trades?.data && trades.data.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                최근 거래
              </h3>
              <div className="space-y-1.5">
                {trades.data.slice(0, 5).map((trade) => {
                  const isOpen = trade.status !== 'CLOSED';
                  const pnl =
                    !isOpen && trade.exit_proceeds != null
                      ? trade.exit_proceeds - trade.filled_cost
                      : null;
                  const isProfit = pnl !== null ? pnl >= 0 : true;

                  return (
                    <div
                      key={trade.id}
                      className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800"
                    >
                      {isOpen ? (
                        <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                      ) : isProfit ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                      )}
                      <span className="truncate text-gray-700 dark:text-gray-300">
                        {trade.symbol}
                      </span>
                      <span
                        className={cn(
                          'ml-auto shrink-0 font-mono text-xs font-medium',
                          isOpen
                            ? 'text-amber-500'
                            : isProfit
                              ? 'text-emerald-500'
                              : 'text-red-500'
                        )}
                      >
                        {isOpen ? 'Open' : pnl !== null ? formatPnL(pnl) : '--'}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400">
                        {formatRelativeTime(trade.entry_timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
