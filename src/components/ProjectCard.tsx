'use client';

import Link from 'next/link';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants';
import { formatRelativeDate, cn } from '@/lib/utils';
import type { ProjectSnapshot } from '@/types';
import {
  GitCommit,
  Clock,
  CheckCircle,
  Package,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface ProjectCardProps {
  snapshot: ProjectSnapshot;
}

export function ProjectCard({ snapshot }: ProjectCardProps) {
  const { project, git, health, changelog } = snapshot;
  const isNeglected = git.daysSinceCommit !== null && git.daysSinceCommit >= 7;
  const isStale = git.daysSinceCommit !== null && git.daysSinceCommit >= 14;
  const platformMeta =
    project.platform === 'windows'
      ? { label: 'Windows', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' }
      : project.platform === 'wsl'
        ? { label: 'WSL', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' }
        : project.platform === 'both'
          ? { label: 'Both', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' }
          : null;

  return (
    <Link
      href={`/project/${project.folder}`}
      className={cn(
        'block rounded-xl border p-5 transition-all hover:shadow-md hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600',
        isStale
          ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
          : isNeglected
            ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
            : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
      )}
    >
      {/* 헤더 */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="flex items-center gap-1.5 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {project.name}
            <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {project.description}
          </p>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
            CATEGORY_COLORS[project.category]
          )}
        >
          {CATEGORY_LABELS[project.category]}
        </span>
      </div>

      {/* Git 정보 */}
      <div className="mb-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-400" />
          <span
            className={cn(
              isStale
                ? 'font-medium text-red-600 dark:text-red-400'
                : isNeglected
                  ? 'font-medium text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-600 dark:text-gray-300'
            )}
          >
            {formatRelativeDate(git.lastCommitDate)}
            {isStale && ' (방치됨!)'}
            {isNeglected && !isStale && ' (주의)'}
          </span>
        </div>

        {git.lastCommitMessage && (
          <div className="flex items-center gap-2 text-sm">
            <GitCommit className="h-4 w-4 text-gray-400" />
            <span className="truncate text-gray-600 dark:text-gray-300">
              {git.lastCommitMessage}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <span className="ml-6 text-gray-500 dark:text-gray-400">
            이번 주 커밋: <strong>{git.commitCountWeek}</strong>건
          </span>
        </div>
      </div>

      {/* 건강 상태 */}
      <div className="mb-3 flex flex-wrap gap-2">
        {platformMeta && (
          <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', platformMeta.className)}>
            {platformMeta.label}
          </span>
        )}
        {health.hasPackageJson && (
          <span className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <Package className="h-3 w-3" /> npm
          </span>
        )}
        {health.hasClaude && (
          <span className="flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-xs text-purple-600 dark:bg-purple-900 dark:text-purple-300">
            <FileText className="h-3 w-3" /> CLAUDE.md
          </span>
        )}
        {health.hasChangelog && (
          <span className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            <FileText className="h-3 w-3" /> CHANGELOG
          </span>
        )}
        {!isNeglected && git.lastCommitDate && (
          <span className="flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3" /> 건강
          </span>
        )}
      </div>

      {/* 기술 스택 */}
      <div className="flex flex-wrap gap-1.5">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          >
            {tech}
          </span>
        ))}
        {project.port && (
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            :{project.port}
          </span>
        )}
      </div>

      {project.runCmd && (
        <div className="mt-2 rounded bg-gray-50 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {project.runCmd}
        </div>
      )}

      {/* CHANGELOG */}
      {changelog && (
        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            최근 변경
          </p>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
            {changelog.title}
          </p>
        </div>
      )}
    </Link>
  );
}
