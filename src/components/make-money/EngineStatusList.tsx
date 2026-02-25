'use client';

import { cn } from '@/lib/utils';
import type { RawEngine } from './types';

interface EngineStatusListProps {
  engines: RawEngine[];
}

export function EngineStatusList({ engines }: EngineStatusListProps) {
  if (engines.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        엔진 상태
      </h3>
      <div className="flex flex-wrap gap-2">
        {engines.map((engine) => (
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
  );
}
