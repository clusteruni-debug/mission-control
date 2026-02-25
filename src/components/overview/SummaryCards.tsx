'use client';

import { cn } from '@/lib/utils';
import type { SummaryCardDef } from './types';

interface SummaryCardsProps {
  cards: SummaryCardDef[];
  onNavigate: (tab: string) => void;
}

export function SummaryCards({ cards, onNavigate }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <button
          key={card.title}
          onClick={() => onNavigate(card.tab)}
          className="rounded-xl border border-gray-200 bg-white p-5 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-800"
        >
          <div className="mb-3 flex items-center gap-2">
            <card.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {card.title}
            </h3>
            <span
              className={cn(
                'ml-auto h-2 w-2 rounded-full',
                card.status === 'online'
                  ? 'bg-emerald-500'
                  : card.status === 'offline'
                    ? 'bg-red-500'
                    : 'bg-gray-400'
              )}
            />
          </div>
          {card.rows.length > 0 ? (
            <div className="space-y-1.5">
              {card.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    {row.label}
                  </span>
                  <span
                    className={cn(
                      'font-semibold',
                      row.color ??
                        'text-gray-900 dark:text-gray-100'
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-2 text-center text-xs text-gray-400 dark:text-gray-500">
              오프라인
            </p>
          )}
        </button>
      ))}
    </div>
  );
}
