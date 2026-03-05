'use client';

import { INFRA_INSTANCES, PROJECTS } from '@/lib/constants';
import { Database, Server, Flame } from 'lucide-react';

const INSTANCE_STYLE: Record<string, { icon: typeof Database; border: string; bg: string; iconColor: string }> = {
  'supabase-1': { icon: Database, border: 'border-purple-300 dark:border-purple-700', bg: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-500' },
  'supabase-2': { icon: Server, border: 'border-purple-300 dark:border-purple-700', bg: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-500' },
  firebase: { icon: Flame, border: 'border-amber-300 dark:border-amber-700', bg: 'bg-amber-50 dark:bg-amber-950/30', iconColor: 'text-amber-500' },
};

export function InfrastructureMap() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {INFRA_INSTANCES.map((inst) => {
        const style = INSTANCE_STYLE[inst.id] ?? INSTANCE_STYLE['supabase-1'];
        const Icon = style.icon;

        return (
          <div
            key={inst.id}
            className={`rounded-xl border ${style.border} ${style.bg} p-4`}
          >
            <div className="mb-3 flex items-center gap-2">
              <Icon className={`h-5 w-5 ${style.iconColor}`} />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {inst.name}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {inst.projects.map((folder) => {
                const proj = PROJECTS.find((p) => p.folder === folder);
                return (
                  <span
                    key={folder}
                    className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300"
                  >
                    {proj?.name ?? folder}
                  </span>
                );
              })}
            </div>
            {inst.tableCount != null && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {inst.tableCount} tables
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
