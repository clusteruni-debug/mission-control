'use client';

import { PROJECTS, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ExternalLink, Monitor, Rocket } from 'lucide-react';

export function QuickLaunch() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center gap-2">
        <Rocket className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Quick Launch
        </h3>
      </div>

      <div className="space-y-1">
        {PROJECTS.filter((p) => p.deployUrl || p.port).map((p) => {
          const localUrl = p.port ? `http://localhost:${p.port}` : null;
          const platform =
            p.deployUrl
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
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {/* 프로젝트 이름 + 카테고리 */}
              <span className="w-36 shrink-0 truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                {p.name}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium text-white',
                  CATEGORY_COLORS[p.category],
                )}
              >
                {CATEGORY_LABELS[p.category]}
              </span>

              {/* 링크 영역 */}
              <div className="ml-auto flex items-center gap-2">
                {p.deployUrl && (
                  <a
                    href={p.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
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
    </div>
  );
}
