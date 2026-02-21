'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants';
import { formatRelativeDate, cn } from '@/lib/utils';
import type { DetailScanResult, ProjectDetail } from '@/types';
import { GITHUB_OWNER, PROJECTS } from '@/lib/constants';
import {
  ArrowLeft,
  GitCommit,
  Clock,
  Package,
  FileText,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ExternalLink,
  Link2,
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams<{ folder: string }>();
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [scannedAt, setScannedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!params.folder) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scan/${params.folder}`);
      if (!res.ok) {
        throw new Error('프로젝트를 찾을 수 없습니다');
      }
      const data: DetailScanResult = await res.json();
      setDetail(data.detail);
      setScannedAt(data.scannedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  }, [params.folder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500">프로젝트 스캔 중...</span>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          {error || '프로젝트를 찾을 수 없습니다'}
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" /> 대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  const { project, git, health, fullChangelog } = detail;
  const isNeglected = git.daysSinceCommit !== null && git.daysSinceCommit >= 7;
  const isStale = git.daysSinceCommit !== null && git.daysSinceCommit >= 14;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* 헤더 */}
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
            onClick={fetchData}
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
      </div>

      {/* 빠른 액션 */}
      <div className="mb-6 flex flex-wrap gap-2">
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

      {/* 연동 프로젝트 */}
      {project.connections && project.connections.length > 0 && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            연동된 프로젝트
          </p>
          <div className="flex flex-wrap gap-2">
            {project.connections.map((folder) => {
              const linked = PROJECTS.find((p) => p.folder === folder);
              if (!linked) return null;
              return (
                <Link
                  key={folder}
                  href={`/project/${folder}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <Link2 className="h-3.5 w-3.5 text-green-500" />
                  {linked.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          icon={Clock}
          label="마지막 커밋"
          value={formatRelativeDate(git.lastCommitDate)}
          alert={isStale ? 'danger' : isNeglected ? 'warn' : undefined}
        />
        <SummaryCard
          icon={GitCommit}
          label="이번 주 커밋"
          value={`${git.commitCountWeek}건`}
        />
        <SummaryCard
          icon={Package}
          label="npm"
          value={health.hasPackageJson ? '있음' : '없음'}
        />
        <SummaryCard
          icon={FileText}
          label="CLAUDE.md"
          value={health.hasClaude ? '있음' : '없음'}
          alert={!health.hasClaude ? 'warn' : undefined}
        />
      </div>

      {/* 기술 스택 */}
      <Section title="기술 스택">
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </Section>

      {/* 커밋 히스토리 */}
      <Section title="최근 커밋">
        {!git.recentCommits?.length ? (
          <p className="text-sm text-gray-400">커밋 기록이 없습니다</p>
        ) : (
          <div className="space-y-0">
            {git.recentCommits.map((commit, i) => (
              <div
                key={commit.sha}
                className="flex items-start gap-3 border-l-2 border-gray-200 py-3 pl-4 dark:border-gray-700"
              >
                <div
                  className={cn(
                    '-ml-[21px] mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full',
                    i === 0
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {commit.message}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatRelativeDate(commit.date)}{' '}
                    <span className="font-mono text-gray-300 dark:text-gray-600">
                      {commit.sha.slice(0, 7)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* CHANGELOG */}
      <Section title="CHANGELOG">
        {fullChangelog ? (
          <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {fullChangelog.slice(0, 3000)}
              {fullChangelog.length > 3000 && '\n\n... (잘림)'}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-gray-400">CHANGELOG 파일이 없습니다</p>
        )}
      </Section>
    </div>
  );
}

// --- 하위 컴포넌트 ---

function SummaryCard({
  icon: Icon,
  label,
  value,
  alert,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  alert?: 'warn' | 'danger';
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        alert === 'danger'
          ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
          : alert === 'warn'
            ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
            : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
      )}
    >
      <Icon
        className={cn(
          'mb-2 h-5 w-5',
          alert === 'danger'
            ? 'text-red-500'
            : alert === 'warn'
              ? 'text-yellow-500'
              : 'text-gray-400'
        )}
      />
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {children}
    </section>
  );
}
