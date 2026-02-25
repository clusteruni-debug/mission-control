'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, CATEGORY_COLORS, GITHUB_OWNER } from '@/lib/constants';
import { ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';
import type { ProjectConfig } from '@/types';

interface ProjectHeaderProps {
  project: ProjectConfig;
  scannedAt: string | null;
  loading: boolean;
  onRefresh: () => void;
}

export function ProjectHeader({ project, scannedAt, loading, onRefresh }: ProjectHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft className="h-4 w-4" /> 대시보드
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {project.name}
            </h1>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
                CATEGORY_COLORS[project.category]
              )}
            >
              {CATEGORY_LABELS[project.category]}
            </span>
          </div>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {project.description}
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          <RefreshCw className="h-4 w-4" />
          새로고침
        </button>
      </div>

      {scannedAt && (
        <p className="mt-2 text-xs text-gray-400">
          {new Date(scannedAt).toLocaleString('ko-KR')} 스캔
        </p>
      )}

      {/* 빠른 액션 */}
      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href={`https://github.com/${GITHUB_OWNER}/${project.repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <ExternalLink className="h-4 w-4" /> GitHub
        </a>
        {project.deployUrl && (
          <a
            href={project.deployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <ExternalLink className="h-4 w-4" /> 배포 사이트
          </a>
        )}
      </div>
    </div>
  );
}
