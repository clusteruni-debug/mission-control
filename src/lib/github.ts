import { GITHUB_OWNER, PROJECTS } from './constants';
import type { ProjectConfig } from '@/types';

// GitHub API 설정
const GITHUB_API = 'https://api.github.com';
const headers: Record<string, string> = {
  Accept: 'application/vnd.github.v3+json',
};

// 서버 사이드에서만 토큰 사용
if (typeof process !== 'undefined' && process.env.GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
}

// --- 타입 ---

export interface GitHubCommit {
  sha: string;
  date: string;
  message: string;
  author: string;
}

export interface GitHubRepoInfo {
  lastCommitDate: string | null;
  lastCommitMessage: string | null;
  commitCountWeek: number;
  recentCommits: GitHubCommit[];
  daysSinceCommit: number | null;
  defaultBranch: string;
}

export interface GitHubProjectSnapshot {
  project: ProjectConfig;
  git: GitHubRepoInfo;
  health: {
    hasPackageJson: boolean;
    hasClaude: boolean;
    hasChangelog: boolean;
  };
  changelog: { title: string; content: string } | null;
  /** CHANGELOG에서 자동 추출한 현재 단계 */
  livePhase: string | null;
  /** CLAUDE.md에서 자동 추출한 다음 할 일 */
  liveNextTasks: string[] | null;
}

export interface GitHubProjectDetail extends GitHubProjectSnapshot {
  fullChangelog: string | null;
  fullClaude: string | null;
}

// --- API 호출 ---

async function githubFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${GITHUB_API}${path}`, {
      headers,
      next: { revalidate: 300 }, // 5분 캐시
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// 커밋 목록 가져오기
async function fetchCommits(
  repo: string,
  count: number = 5
): Promise<GitHubCommit[]> {
  interface GHCommit {
    sha: string;
    commit: {
      message: string;
      author: { date: string; name: string };
    };
  }

  const data = await githubFetch<GHCommit[]>(
    `/repos/${GITHUB_OWNER}/${repo}/commits?per_page=${count}`
  );
  if (!data) return [];

  return data.map((c) => ({
    sha: c.sha,
    date: c.commit.author.date,
    message: c.commit.message.split('\n')[0], // 첫 줄만
    author: c.commit.author.name,
  }));
}

// 이번 주 커밋 수
async function fetchWeekCommitCount(repo: string): Promise<number> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const since = weekAgo.toISOString();

  interface GHCommit {
    sha: string;
  }

  // per_page=100 으로 한 주 커밋 카운트 (100개 넘으면 근사치)
  const data = await githubFetch<GHCommit[]>(
    `/repos/${GITHUB_OWNER}/${repo}/commits?since=${since}&per_page=100`
  );
  return data?.length ?? 0;
}

// 파일 존재 여부 확인
async function fileExists(repo: string, path: string): Promise<boolean> {
  const res = await githubFetch<{ name: string }>(
    `/repos/${GITHUB_OWNER}/${repo}/contents/${path}`
  );
  return res !== null;
}

// 파일 내용 가져오기
async function fetchFileContent(
  repo: string,
  path: string
): Promise<string | null> {
  interface GHContent {
    content: string;
    encoding: string;
  }

  const data = await githubFetch<GHContent>(
    `/repos/${GITHUB_OWNER}/${repo}/contents/${path}`
  );
  if (!data?.content) return null;

  // base64 디코딩
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

// 레포 기본 정보 (pushed_at: 모든 브랜치 중 가장 최근 push 시각)
async function fetchRepoInfo(repo: string): Promise<{ defaultBranch: string; pushedAt: string | null } | null> {
  interface GHRepo {
    default_branch: string;
    pushed_at: string;
  }

  const data = await githubFetch<GHRepo>(
    `/repos/${GITHUB_OWNER}/${repo}`
  );
  if (!data) return null;
  return { defaultBranch: data.default_branch, pushedAt: data.pushed_at ?? null };
}

// --- CHANGELOG 파싱 ---

function parseChangelogTitle(content: string): { title: string; content: string } | null {
  const match = content.match(/^## (.+)\n([\s\S]*?)(?=\n## |\n*$)/m);
  if (match) {
    return {
      title: match[1].trim(),
      content: match[2].trim().slice(0, 500),
    };
  }
  return null;
}

/**
 * CHANGELOG 최신 제목에서 phase를 추출한다.
 * 예: "## [2026-03-01] 세션 15 — 5엔진 활성화 + 뉴스 튜닝"
 *   → "5엔진 활성화 + 뉴스 튜닝"
 */
function extractPhaseFromChangelog(content: string): string | null {
  const match = content.match(/^## (.+)/m);
  if (!match) return null;
  const title = match[1].trim();
  // "— " 뒤의 설명 부분 추출 (없으면 날짜/세션 번호 제거 후 전체)
  const dashIdx = title.indexOf('—');
  if (dashIdx !== -1) {
    return title.slice(dashIdx + 1).trim();
  }
  // 날짜 패턴 [YYYY-MM-DD] 제거
  return title.replace(/\[?\d{4}-\d{2}-\d{2}\]?\s*/g, '').trim() || null;
}

/**
 * CLAUDE.md에서 다음 할 일(nextTasks)을 추출한다.
 * 패턴: "## 다음", "## TODO", "## Next", "## 로드맵" 섹션의 - 항목
 */
function extractNextTasksFromClaude(content: string): string[] | null {
  // 다양한 섹션 헤더 매칭
  const sectionMatch = content.match(
    /^##\s+(?:다음|TODO|Next|로드맵|다음 할 일|Roadmap|할 일)\s*\n([\s\S]*?)(?=\n## |\n*$)/mi
  );
  if (!sectionMatch) return null;

  const lines = sectionMatch[1].split('\n');
  const tasks: string[] = [];
  for (const line of lines) {
    const taskMatch = line.match(/^\s*[-*]\s+(.+)/);
    if (taskMatch && tasks.length < 3) {
      // 체크박스 마크다운 제거: [ ] 또는 [x]
      const cleaned = taskMatch[1].replace(/^\[[ x]\]\s*/i, '').trim();
      if (cleaned) tasks.push(cleaned);
    }
  }
  return tasks.length > 0 ? tasks : null;
}

// --- 메인 스캔 함수 ---

export async function scanProject(
  project: ProjectConfig
): Promise<GitHubProjectSnapshot> {
  // fileExists 대신 fetchFileContent로 한번에 가져와서 API 호출 절감
  const [commits, weekCount, repoInfo, hasPackageJson, changelogContent, claudeContent] =
    await Promise.all([
      fetchCommits(project.repo, 5),
      fetchWeekCommitCount(project.repo),
      fetchRepoInfo(project.repo),
      fileExists(project.repo, 'package.json'),
      fetchFileContent(project.repo, 'CHANGELOG.md'),
      fetchFileContent(project.repo, 'CLAUDE.md'),
    ]);

  const lastCommit = commits[0] ?? null;
  const lastCommitDate = lastCommit?.date ?? null;
  const pushedAt = repoInfo?.pushedAt ?? null;

  // pushed_at은 모든 브랜치를 반영 — 비기본 브랜치 활동도 감지
  const effectiveDate = (lastCommitDate && pushedAt)
    ? (new Date(pushedAt) > new Date(lastCommitDate) ? pushedAt : lastCommitDate)
    : lastCommitDate ?? pushedAt;

  let daysSinceCommit: number | null = null;
  if (effectiveDate) {
    const diff = Date.now() - new Date(effectiveDate).getTime();
    daysSinceCommit = Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  const changelog = changelogContent
    ? parseChangelogTitle(changelogContent)
    : null;
  const livePhase = changelogContent
    ? extractPhaseFromChangelog(changelogContent)
    : null;
  const liveNextTasks = claudeContent
    ? extractNextTasksFromClaude(claudeContent)
    : null;

  return {
    project,
    git: {
      lastCommitDate: effectiveDate,
      lastCommitMessage: lastCommit?.message ?? null,
      commitCountWeek: weekCount,
      recentCommits: commits,
      daysSinceCommit,
      defaultBranch: repoInfo?.defaultBranch ?? 'main',
    },
    health: {
      hasPackageJson,
      hasClaude: claudeContent !== null,
      hasChangelog: changelogContent !== null,
    },
    changelog,
    livePhase,
    liveNextTasks,
  };
}

export async function scanProjectDetail(
  project: ProjectConfig
): Promise<GitHubProjectDetail> {
  const [commits, weekCount, repoInfo, hasPackageJson, changelogContent, claudeContent] =
    await Promise.all([
      fetchCommits(project.repo, 20),
      fetchWeekCommitCount(project.repo),
      fetchRepoInfo(project.repo),
      fileExists(project.repo, 'package.json'),
      fetchFileContent(project.repo, 'CHANGELOG.md'),
      fetchFileContent(project.repo, 'CLAUDE.md'),
    ]);

  const lastCommit = commits[0] ?? null;
  const lastCommitDate = lastCommit?.date ?? null;
  const pushedAt = repoInfo?.pushedAt ?? null;

  const effectiveDate = (lastCommitDate && pushedAt)
    ? (new Date(pushedAt) > new Date(lastCommitDate) ? pushedAt : lastCommitDate)
    : lastCommitDate ?? pushedAt;

  let daysSinceCommit: number | null = null;
  if (effectiveDate) {
    const diff = Date.now() - new Date(effectiveDate).getTime();
    daysSinceCommit = Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  const changelog = changelogContent
    ? parseChangelogTitle(changelogContent)
    : null;
  const livePhase = changelogContent
    ? extractPhaseFromChangelog(changelogContent)
    : null;
  const liveNextTasks = claudeContent
    ? extractNextTasksFromClaude(claudeContent)
    : null;

  return {
    project,
    git: {
      lastCommitDate: effectiveDate,
      lastCommitMessage: lastCommit?.message ?? null,
      commitCountWeek: weekCount,
      recentCommits: commits,
      daysSinceCommit,
      defaultBranch: repoInfo?.defaultBranch ?? 'main',
    },
    health: {
      hasPackageJson,
      hasClaude: claudeContent !== null,
      hasChangelog: changelogContent !== null,
    },
    changelog,
    livePhase,
    liveNextTasks,
    fullChangelog: changelogContent,
    fullClaude: claudeContent,
  };
}

export async function scanAllProjects(): Promise<GitHubProjectSnapshot[]> {
  const results = await Promise.all(
    PROJECTS.map((p) => scanProject(p).catch(() => null))
  );
  return results.filter((r): r is GitHubProjectSnapshot => r !== null);
}

// 전체 프로젝트의 최근 커밋을 합쳐서 시간순 정렬 (활동 피드용)
export async function fetchUnifiedFeed(
  count: number = 30
): Promise<(GitHubCommit & { project: string; repo: string })[]> {
  const allCommits = await Promise.all(
    PROJECTS.map(async (p) => {
      const commits = await fetchCommits(p.repo, 10);
      return commits.map((c) => ({ ...c, project: p.name, repo: p.repo }));
    })
  );

  return allCommits
    .flat()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}
