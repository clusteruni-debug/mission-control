'use client';

import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { RawTrade } from './types';
import { formatPnL, formatRelativeTime } from './format-utils';

interface RecentTradesProps {
  trades: RawTrade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  if (trades.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        최근 거래
      </h3>
      <div className="space-y-1.5">
        {trades.slice(0, 5).map((trade) => {
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
  );
}
