export type ProjectPlatform = 'windows' | 'wsl' | 'both';

export type ProjectPriority = 'high' | 'medium' | 'low' | 'maintenance';

export type ConnectionType =
  | 'supabase-shared'
  | 'firebase'
  | 'api-proxy'
  | 'api-direct'
  | 'url-handoff'
  | 'chrome-extension'
  | 'shared-instance';

export interface ConnectionDef {
  target: string;
  type: ConnectionType;
  label?: string;
}

export type TaskType = 'task' | 'backlog' | 'bug' | 'feature' | 'integration-idea' | 'maintenance';

export interface ProjectConfig {
  name: string;
  folder: string;
  repo: string;
  description: string;
  techStack: string[];
  category: 'running' | 'dev' | 'legacy' | 'tool';
  deployUrl?: string;
  connections?: ConnectionDef[];
  platform?: ProjectPlatform;
  runCmd?: string;
  port?: number;
  /** 현재 개발 단계 (예: "운영 안정화", "Phase 1", "MVP 완료") */
  phase?: string;
  /** 전체 완성도 퍼센트 (0-100) */
  completionPct?: number;
  /** 다음 할 일 목록 (최대 3개) */
  nextTasks?: string[];
  /** 우선순위 */
  priority?: ProjectPriority;
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
  /** CHANGELOG에서 자동 추출한 현재 단계 (없으면 project.phase 폴백) */
  livePhase: string | null;
  /** CLAUDE.md에서 자동 추출한 다음 할 일 (없으면 project.nextTasks 폴백) */
  liveNextTasks: string[] | null;
}

export interface ProjectDetail extends ProjectSnapshot {
  fullChangelog: string | null;
  fullClaude: string | null;
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

// --- User Tasks (Supabase mc_tasks) ---

export interface UserTask {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  type: TaskType;
  project: string;
  created_at: string;
  updated_at: string;
}
