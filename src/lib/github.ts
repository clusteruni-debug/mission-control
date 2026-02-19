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
}

export interface GitHubProjectDetail extends GitHubProjectSnapshot {
  fullChangelog: string | null;
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

// 레포 기본 정보
async function fetchRepoInfo(repo: string): Promise<{ defaultBranch: string } | null> {
  interface GHRepo {
    default_branch: string;
  }

  const data = await githubFetch<GHRepo>(
    `/repos/${GITHUB_OWNER}/${repo}`
  );
  if (!data) return null;
  return { defaultBranch: data.default_branch };
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

// --- 메인 스캔 함수 ---

export async function scanProject(
  project: ProjectConfig
): Promise<GitHubProjectSnapshot> {
  const [commits, weekCount, repoInfo, hasPackageJson, hasClaude, hasChangelog] =
    await Promise.all([
      fetchCommits(project.repo, 5),
      fetchWeekCommitCount(project.repo),
      fetchRepoInfo(project.repo),
      fileExists(project.repo, 'package.json'),
      fileExists(project.repo, 'CLAUDE.md'),
      fileExists(project.repo, 'CHANGELOG.md'),
    ]);

  const lastCommit = commits[0] ?? null;
  let daysSinceCommit: number | null = null;
  if (lastCommit) {
    const diff = Date.now() - new Date(lastCommit.date).getTime();
    daysSinceCommit = Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // CHANGELOG 파싱 (존재하면)
  let changelog: { title: string; content: string } | null = null;
  if (hasChangelog) {
    const content = await fetchFileContent(project.repo, 'CHANGELOG.md');
    if (content) {
      changelog = parseChangelogTitle(content);
    }
  }

  return {
    project,
    git: {
      lastCommitDate: lastCommit?.date ?? null,
      lastCommitMessage: lastCommit?.message ?? null,
      commitCountWeek: weekCount,
      recentCommits: commits,
      daysSinceCommit,
      defaultBranch: repoInfo?.defaultBranch ?? 'main',
    },
    health: {
      hasPackageJson,
      hasClaude,
      hasChangelog,
    },
    changelog,
  };
}

export async function scanProjectDetail(
  project: ProjectConfig
): Promise<GitHubProjectDetail> {
  const [commits, weekCount, repoInfo, hasPackageJson, hasClaude, changelogContent] =
    await Promise.all([
      fetchCommits(project.repo, 20),
      fetchWeekCommitCount(project.repo),
      fetchRepoInfo(project.repo),
      fileExists(project.repo, 'package.json'),
      fileExists(project.repo, 'CLAUDE.md'),
      fetchFileContent(project.repo, 'CHANGELOG.md'),
    ]);

  const lastCommit = commits[0] ?? null;
  let daysSinceCommit: number | null = null;
  if (lastCommit) {
    const diff = Date.now() - new Date(lastCommit.date).getTime();
    daysSinceCommit = Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  const changelog = changelogContent
    ? parseChangelogTitle(changelogContent)
    : null;

  return {
    project,
    git: {
      lastCommitDate: lastCommit?.date ?? null,
      lastCommitMessage: lastCommit?.message ?? null,
      commitCountWeek: weekCount,
      recentCommits: commits,
      daysSinceCommit,
      defaultBranch: repoInfo?.defaultBranch ?? 'main',
    },
    health: {
      hasPackageJson,
      hasClaude,
      hasChangelog: changelogContent !== null,
    },
    changelog,
    fullChangelog: changelogContent,
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
