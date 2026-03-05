'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { BarChart3, TrendingUp, Shield, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { MAKE_MONEY_TUNING_DATE } from '@/lib/constants';
import type { ProxyResponse } from '@/types/status';
import type { RawTrade, RawPortfolio } from './types';
import { formatCurrency, formatPnL } from './format-utils';

interface PeriodStats {
  label: string;
  trades: number;
  wins: number;
  winRate: number;
  pnl: number;
}

function computePeriodStats(trades: RawTrade[]): PeriodStats[] {
  const now = Date.now();
  const day7 = now - 7 * 24 * 3600000;
  const day30 = now - 30 * 24 * 3600000;

  const closedTrades = trades.filter((t) => t.status === 'CLOSED' && t.exit_proceeds != null);

  const postTuning = closedTrades.filter((t) => t.entry_timestamp >= MAKE_MONEY_TUNING_DATE);
  const preTuning = closedTrades.filter((t) => t.entry_timestamp < MAKE_MONEY_TUNING_DATE);

  const calc = (label: string, list: RawTrade[]): PeriodStats => {
    const wins = list.filter((t) => (t.exit_proceeds ?? 0) - t.filled_cost >= 0).length;
    const pnl = list.reduce((sum, t) => sum + ((t.exit_proceeds ?? 0) - t.filled_cost), 0);
    return {
      label,
      trades: list.length,
      wins,
      winRate: list.length > 0 ? wins / list.length : 0,
      pnl,
    };
  };

  return [
    calc('7일', closedTrades.filter((t) => t.entry_timestamp >= day7)),
    calc('30일', closedTrades.filter((t) => t.entry_timestamp >= day30)),
    calc('튜닝 후', postTuning),
    calc('튜닝 전', preTuning),
    calc('전체', closedTrades),
  ];
}

function computeRiskLevel(portfolio: RawPortfolio | null, trades: RawTrade[]): {
  level: 'low' | 'medium' | 'high';
  ratio: number;
} {
  if (!portfolio || portfolio.balance <= 0) return { level: 'high', ratio: 1 };

  const openTrades = trades.filter((t) => t.status !== 'CLOSED');
  const openCost = openTrades.reduce((sum, t) => sum + t.filled_cost, 0);
  const ratio = openCost / portfolio.balance;

  if (ratio < 0.3) return { level: 'low', ratio };
  if (ratio < 0.6) return { level: 'medium', ratio };
  return { level: 'high', ratio };
}

export function DeepMonitoring() {
  const [trades, setTrades] = useState<RawTrade[]>([]);
  const [portfolio, setPortfolio] = useState<RawPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchDeep = async () => {
      try {
        const [tRes, pRes] = await Promise.all([
          fetch('/api/make-money?path=trades-deep').then((r) => r.json()) as Promise<ProxyResponse<RawTrade[]>>,
          fetch('/api/make-money?path=portfolio').then((r) => r.json()) as Promise<ProxyResponse<RawPortfolio>>,
        ]);
        if (tRes.data) setTrades(tRes.data);
        if (pRes.data) setPortfolio(pRes.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchDeep();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        딥 모니터링 로딩...
      </div>
    );
  }

  if (trades.length === 0) return null;

  const periodStats = computePeriodStats(trades);
  const risk = computeRiskLevel(portfolio, trades);

  const riskColors = {
    low: 'text-emerald-500',
    medium: 'text-amber-500',
    high: 'text-red-500',
  };
  const riskBg = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
  };
  const riskLabels = { low: '안전', medium: '주의', high: '위험' };

  return (
    <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <BarChart3 className="h-3 w-3" />
        딥 모니터링
        {expanded ? <ChevronUp className="ml-auto h-3 w-3" /> : <ChevronDown className="ml-auto h-3 w-3" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Risk Gauge */}
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="mb-1.5 flex items-center gap-2">
              <Shield className={cn('h-3.5 w-3.5', riskColors[risk.level])} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">리스크</span>
              <span className={cn('text-xs font-bold', riskColors[risk.level])}>
                {riskLabels[risk.level]}
              </span>
              <span className="ml-auto text-[10px] text-gray-400">
                포지션/잔고: {(risk.ratio * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={cn('h-full rounded-full transition-all', riskBg[risk.level])}
                style={{ width: `${Math.min(risk.ratio * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Period Win Rate Comparison */}
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                기간별 성과
              </span>
            </div>
            <div className="space-y-1.5">
              {periodStats.map((ps) => (
                <div key={ps.label} className="flex items-center gap-2 text-xs">
                  <span className="w-12 shrink-0 font-medium text-gray-600 dark:text-gray-400">
                    {ps.label}
                  </span>
                  <div className="flex-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          ps.winRate >= 0.5 ? 'bg-emerald-500' : 'bg-red-400'
                        )}
                        style={{ width: `${ps.winRate * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-gray-600 dark:text-gray-400">
                    {ps.trades > 0 ? `${Math.round(ps.winRate * 100)}%` : '-'}
                  </span>
                  <span className="w-10 shrink-0 text-right text-[10px] text-gray-400">
                    {ps.trades}건
                  </span>
                  <span
                    className={cn(
                      'w-16 shrink-0 text-right font-mono text-[10px]',
                      ps.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'
                    )}
                  >
                    {ps.trades > 0 ? formatPnL(ps.pnl) : '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
