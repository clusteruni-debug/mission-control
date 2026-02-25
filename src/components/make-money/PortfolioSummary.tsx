'use client';

import { cn } from '@/lib/utils';
import { DollarSign, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import type { RawPortfolio } from './types';
import { formatCurrency, formatPnL } from './format-utils';

interface PortfolioSummaryProps {
  portfolio: RawPortfolio;
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <DollarSign className="h-3.5 w-3.5" />
          잔고
        </div>
        <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(portfolio.balance)}
        </p>
      </div>
      <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          {portfolio.totalPnL >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          총 P&L
        </div>
        <p
          className={cn(
            'mt-1 text-xl font-bold',
            portfolio.totalPnL >= 0
              ? 'text-emerald-500'
              : 'text-red-500'
          )}
        >
          {formatPnL(portfolio.totalPnL)}
        </p>
      </div>
      <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Zap className="h-3.5 w-3.5" />
          승률
        </div>
        <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
          {Math.round(portfolio.winRate * 100)}%
        </p>
      </div>
    </div>
  );
}
