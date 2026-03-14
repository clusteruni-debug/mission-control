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
  category: 'running' | 'dev' | 'legacy' | 'tool' | 'stopped';
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
  /** CHANGELOG에서 자동 추출한 현재 단계 */
  livePhase: string | null;
  /** CLAUDE.md에서 자동 추출한 다음 할 일 */
  liveNextTasks: string[] | null;
  /** pm2/systemd 실시간 상태 기반 카테고리 (없으면 project.category 폴백) */
  runtimeCategory?: ProjectConfig['category'];
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

// --- Service Control ---

export type Pm2Status = 'online' | 'stopping' | 'stopped' | 'errored' | 'launching';

export type ServiceRuntime = 'pm2' | 'wsl-systemd' | 'manual';

export type ServiceCategory = 'always-on' | 'dev-server' | 'paper-trading' | 'wsl';

export interface ServiceRegistryEntry {
  name: string;
  runtime: ServiceRuntime;
  category: ServiceCategory;
  projectFolder?: string;
  port?: number;
  autorestart: boolean;
  protected: boolean;
}

export interface Pm2ServiceInfo {
  name: string;
  pm_id: number | null;
  status: Pm2Status | 'active' | 'inactive' | 'failed' | 'not_registered' | 'unknown';
  cpu: number | null;
  memory: number | null;
  uptime: number | null;
  restarts: number;
  runtime: ServiceRuntime;
  autorestart: boolean;
  port: number | null;
  category: ServiceCategory;
  protected: boolean;
}

export type ServiceAction = 'start' | 'stop' | 'restart';

// --- Incidents ---

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';
export type IncidentSource = 'manual' | 'auto-recovery' | 'health-check';

export interface Incident {
  id: number;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  services_affected: string[];
  detected_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  source: IncidentSource;
  action_taken: string | null;
  recovery_duration_ms: number | null;
  retry_count: number;
}

// --- Agent Queue ---

export type AgentTaskPhase = 'proposed' | 'pending' | 'plan' | 'build' | 'review' | 'done' | 'failed' | 'escalated';
export type AgentTaskSource = 'manual' | 'patrol-bug' | 'patrol-roadmap' | 'patrol-quality';

export interface AgentTask {
  id: string;
  created_at: string;
  project: string;
  title: string;
  description: string;
  priority: number;
  phase: AgentTaskPhase;
  parent_id: string | null;
  role: string | null;
  agent: string | null;
  attempt: number;
  review_result: string | null;
  review_feedback: string | null;
  started_at: string | null;
  finished_at: string | null;
  result_summary: string | null;
  commit_sha: string | null;
  error: string | null;
  source: AgentTaskSource;
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
