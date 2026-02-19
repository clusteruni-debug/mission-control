import { NextResponse } from 'next/server';
import { scanAllProjects, fetchUnifiedFeed } from '@/lib/github';
import { getTaskBoardItems } from '@/lib/task-board';
import { PROJECTS } from '@/lib/constants';
import type { GitHubProjectSnapshot } from '@/lib/github';
import type { TaskBoardItem } from '@/types';

export const dynamic = 'force-dynamic';

function buildMarkdown(
  snapshots: GitHubProjectSnapshot[],
  feed: { project: string; message: string; date: string }[],
  tasks: TaskBoardItem[]
): string {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const lines: string[] = [];

  // Header
  lines.push('# 바이브코딩 — Claude.ai 컨텍스트 브리핑');
  lines.push(`> 자동 생성: ${now}`);
  lines.push('');

  // §1 워크스페이스 개요
  lines.push('## §1 워크스페이스 개요');
  lines.push(
    `- 환경: Windows 데스크탑 + WSL (SSH 원격 접속), 프로젝트 ${PROJECTS.length}개`
  );
  lines.push(
    '- 워크플로우: Claude.ai(설계) → Codex(실행) → Claude Code(검수)'
  );
  lines.push(
    '- 문서 체계: CLAUDE.md(규칙) + AGENTS.md(협업) + CHANGELOG.md(이력)'
  );
  lines.push('');

  // §2 프로젝트 현황
  lines.push('## §2 프로젝트 현황');
  lines.push('| 프로젝트 | 스택 | 배포 | 최근 커밋 | 경과일 |');
  lines.push('|----------|------|------|-----------|--------|');
  for (const snap of snapshots) {
    const stack = snap.project.techStack.slice(0, 3).join(', ');
    const deploy = snap.project.deployUrl ? '✅' : '로컬';
    const lastMsg = snap.git.lastCommitMessage
      ? snap.git.lastCommitMessage.slice(0, 40)
      : '—';
    const days =
      snap.git.daysSinceCommit !== null
        ? `${snap.git.daysSinceCommit}일`
        : '—';
    lines.push(
      `| ${snap.project.name} | ${stack} | ${deploy} | ${lastMsg} | ${days} |`
    );
  }
  lines.push('');

  // §3 최근 활동 (7일)
  lines.push('## §3 최근 활동 (7일)');
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekFeed = feed.filter((f) => new Date(f.date).getTime() > weekAgo);

  const byProject = new Map<string, typeof weekFeed>();
  for (const item of weekFeed) {
    const arr = byProject.get(item.project) || [];
    arr.push(item);
    byProject.set(item.project, arr);
  }

  if (byProject.size === 0) {
    lines.push('최근 7일간 활동 없음');
  } else {
    for (const [project, commits] of byProject) {
      lines.push(`- **${project}**: ${commits.length}건`);
      for (const c of commits.slice(0, 3)) {
        lines.push(`  - ${c.message}`);
      }
    }
  }
  lines.push('');

  // §4 활성 작업
  lines.push('## §4 활성 작업');
  const activeTasks = tasks.filter(
    (t) =>
      t.status !== 'done' &&
      t.status !== 'completed' &&
      t.status !== 'cancelled'
  );
  if (activeTasks.length === 0) {
    lines.push('활성 작업 없음');
  } else {
    lines.push('| TASK-ID | 담당 | 상태 | 대상 | 비고 |');
    lines.push('|---------|------|------|------|------|');
    for (const t of activeTasks) {
      lines.push(
        `| ${t.taskId} | ${t.owner} | ${t.status} | ${t.project} | ${t.notes} |`
      );
    }
  }
  lines.push('');

  // §5 블로커/리스크
  lines.push('## §5 블로커/리스크');
  const blockers = tasks.filter(
    (t) => t.status === 'blocked' || t.notes.toLowerCase().includes('block')
  );
  if (blockers.length === 0) {
    lines.push('없음');
  } else {
    for (const b of blockers) {
      lines.push(`- [${b.taskId}] ${b.project}: ${b.notes}`);
    }
  }
  lines.push('');

  // §6 요청 사항
  lines.push('## §6 요청 사항');
  lines.push('(수동 유지 — 자동 갱신 시 이 섹션 보존)');
  lines.push('');

  return lines.join('\n');
}

export async function GET() {
  try {
    const [snapshots, feed, tasks] = await Promise.all([
      scanAllProjects(),
      fetchUnifiedFeed(50),
      getTaskBoardItems(),
    ]);

    const markdown = buildMarkdown(snapshots, feed, tasks);

    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('handoff-web 생성 실패:', error);
    return NextResponse.json(
      { error: 'handoff-web 생성 중 오류 발생' },
      { status: 500 },
    );
  }
}
