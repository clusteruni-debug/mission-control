export type ProjectPlatform = 'windows' | 'wsl' | 'both';

export interface ProjectConfig {
  name: string;
  folder: string;
  repo: string;
  description: string;
  techStack: string[];
  category: 'running' | 'dev' | 'legacy' | 'tool';
  deployUrl?: string;
  connections?: string[];
  platform?: ProjectPlatform;
  runCmd?: string;
  port?: number;
}

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

// 공통 상태 타입 (ProxyResponse, ServiceStatus 등)
export * from './status';

// --- Make Money ---

export interface MakeMoneyPortfolio {
  balance: number;
  totalPnL: number;
  openPositions: number;
  winRate: number;
}

export interface MakeMoneyEngine {
  name: string;
  enabled: boolean;
  lastRun: string;
}

export interface MakeMoneyTrade {
  market: string;
  side: string;
  pnl: number;
  timestamp: string;
}

// --- Task Board ---

export interface TaskBoardItem {
  taskId: string;
  project: string;
  type: string;
  owner: string;
  scopeFiles: string;
  status: string;
  notes: string;
}
