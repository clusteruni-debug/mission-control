'use client';

import { useState } from 'react';
import { PROJECTS, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ExternalLink, Monitor, Rocket, ChevronDown } from 'lucide-react';
import type { ProjectConfig } from '@/types';

const LAUNCH_CATEGORY_ORDER: ProjectConfig['category'][] = ['running', 'dev', 'tool', 'stopped', 'legacy'];
const DEFAULT_EXPANDED: ProjectConfig['category'][] = ['running', 'dev'];

const LAUNCHABLE = PROJECTS.filter((p) => p.deployUrl || p.port);
const GROUPED = LAUNCH_CATEGORY_ORDER.map((cat) => ({
  category: cat,
  projects: LAUNCHABLE.filter((p) => p.category === cat),
})).filter((g) => g.projects.length > 0);

export function QuickLaunch() {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    const set = new Set<string>();
    for (const g of GROUPED) {
      if (!DEFAULT_EXPANDED.includes(g.category)) {
        set.add(g.category);
      }
    }
    return set;
  });

  const toggle = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center gap-2">
        <Rocket className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Quick Launch
        </h3>
      </div>

      <div className="space-y-4">
        {GROUPED.map(({ category, projects }) => {
          const isCollapsed = collapsed.has(category);
          return (
            <div key={category}>
              {/* Category header */}
              <button
                onClick={() => toggle(category)}
                className="mb-2 flex w-full items-center gap-2"
              >
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-white',
                    CATEGORY_COLORS[category],
                  )}
                >
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {projects.length}
                </span>
                <ChevronDown
                  className={cn(
                    'ml-auto h-3.5 w-3.5 text-gray-400 transition-transform',
                    isCollapsed && '-rotate-90',
                  )}
                />
              </button>

              {/* Project grid */}
              {!isCollapsed && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((p) => {
                    const localUrl = p.port ? `http://localhost:${p.port}` : null;
                    const platform = p.deployUrl
                      ? p.deployUrl.includes('vercel.app')
                        ? 'Vercel'
                        : p.deployUrl.includes('github.io')
                          ? 'GH Pages'
                          : p.deployUrl.includes('railway.app')
                            ? 'Railway'
                            : 'Web'
                      : null;

                    return (
                      <div
                        key={p.folder}
                        className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                          {p.name}
                        </span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {p.deployUrl && (
                            <a
                              href={p.deployUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                              title={platform ?? undefined}
                            >
                              <ExternalLink className="h-3 w-3" />
                              {platform}
                            </a>
                          )}
                          {localUrl && (
                            <a
                              href={localUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                              <Monitor className="h-3 w-3" />
                              :{p.port}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
