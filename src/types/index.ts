import type { ProjectConfig } from '@/lib/constants';

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

export interface ProjectHealth {
  hasPackageJson: boolean;
  hasClaude: boolean;
  hasChangelog: boolean;
}

export interface ChangelogEntry {
  title: string;
  content: string;
}

export interface ProjectSnapshot {
  project: ProjectConfig;
  git: GitHubRepoInfo;
  health: ProjectHealth;
  changelog: ChangelogEntry | null;
}

export interface ProjectDetail extends ProjectSnapshot {
  fullChangelog: string | null;
}

export interface ScanResult {
  snapshots: ProjectSnapshot[];
  scannedAt: string;
}

export interface DetailScanResult {
  detail: ProjectDetail;
  scannedAt: string;
}

export interface FeedItem extends GitHubCommit {
  project: string;
  repo: string;
}

export interface FeedResult {
  feed: FeedItem[];
  scannedAt: string;
}
