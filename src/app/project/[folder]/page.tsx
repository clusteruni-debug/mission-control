'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatRelativeDate } from '@/lib/utils';
import type { DetailScanResult, ProjectDetail } from '@/types';
import {
  ArrowLeft,
  GitCommit,
  Clock,
  Package,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { SummaryCard } from '@/components/project-detail/SummaryCard';
import { ProjectHeader } from '@/components/project-detail/ProjectHeader';
import { ConnectionsPanel } from '@/components/project-detail/ConnectionsPanel';
import { CommitHistory } from '@/components/project-detail/CommitHistory';
import { ChangelogSection } from '@/components/project-detail/ChangelogSection';
import { Section } from '@/components/project-detail/Section';

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
      <ProjectHeader
        project={project}
        scannedAt={scannedAt}
        loading={loading}
        onRefresh={fetchData}
      />

      {project.connections && project.connections.length > 0 && (
        <ConnectionsPanel connections={project.connections} />
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

      <CommitHistory commits={git.recentCommits ?? []} />

      <ChangelogSection changelog={fullChangelog} />
    </div>
  );
}
