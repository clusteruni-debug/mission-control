import type { ProjectConfig, ServiceCategory, IncidentSeverity, IncidentStatus } from '@/types';

// 워크스페이스 프로젝트 정의
export const GITHUB_OWNER = 'clusteruni-debug';

// PROJECTS + SERVICE_REGISTRY are auto-generated from config/projects.json + mc-enrichment.json
export { PROJECTS, SERVICE_REGISTRY } from '@/generated/registry';

export const CATEGORY_LABELS: Record<ProjectConfig['category'], string> = {
  running: '운영중',
  dev: '개발중',
  legacy: '레거시',
  tool: '도구',
  stopped: '정지',
};

export const CATEGORY_COLORS: Record<ProjectConfig['category'], string> = {
  running: 'bg-green-500',
  dev: 'bg-blue-500',
  legacy: 'bg-gray-500',
  tool: 'bg-purple-500',
  stopped: 'bg-red-500',
};

export const PRIORITY_LABELS: Record<import('@/types').ProjectPriority, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
  maintenance: '유지보수',
};

export const PRIORITY_COLORS: Record<import('@/types').ProjectPriority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  maintenance: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
};

// ─── Service Registry ───

export const SERVICE_NAME_REGEX = /^[a-z0-9-]+$/;

export const CATEGORY_ORDER: ServiceCategory[] = ['always-on', 'wsl', 'dev-server', 'paper-trading'];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  'always-on': '상시 운영',
  'dev-server': '개발 서버',
  'paper-trading': '페이퍼 트레이딩',
  'wsl': 'WSL',
};

export interface InfraInstance {
  id: string;
  name: string;
  projects: string[];
  tableCount?: number;
}

export const INFRA_INSTANCES: InfraInstance[] = [
  { id: 'supabase-1', name: 'Supabase #1 (hgygyilcr...)', projects: ['article-editor', 'mission-control', 'ai-hub', 'telegram-event-bot'], tableCount: 13 },
  { id: 'supabase-2', name: 'Supabase #2 (mrgbwlhhn...)', projects: ['web3-budget-app', 'Kimpbotforme', 'make-money-project'], tableCount: 17 },
  { id: 'firebase', name: 'Firebase (independent)', projects: ['baby-care', 'Saitama-training', 'To-do-list-for-adhd'] },
];

// ─── Incident Management ───

export const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  critical: '심각',
  high: '높음',
  medium: '보통',
  low: '낮음',
};

export const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  open: '발생',
  investigating: '조사 중',
  resolved: '해결됨',
};

export const INCIDENT_STATUS_COLORS: Record<IncidentStatus, string> = {
  open: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  investigating: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
};

// ─── Incident Source ───

import type { IncidentSource } from '@/types';

export const INCIDENT_SOURCE_LABELS: Record<IncidentSource, string> = {
  manual: '수동',
  'auto-recovery': '자동 복구',
  'health-check': '상태 체크',
};

export const INCIDENT_SOURCE_COLORS: Record<IncidentSource, string> = {
  manual: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'auto-recovery': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  'health-check': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
};

// Make Money tuning date (for 3-period win rate comparison)
export const MAKE_MONEY_TUNING_DATE = new Date('2026-03-01T00:00:00Z').getTime();

// ─── Agent Queue ───

import type { AgentTaskPhase } from '@/types';

export const AGENT_PHASE_LABELS: Record<AgentTaskPhase, string> = {
  proposed: '제안됨',
  pending: '대기',
  plan: '계획 중',
  build: '빌드 중',
  review: '검토 중',
  done: '완료',
  failed: '실패',
  escalated: '에스컬레이션',
};

export const AGENT_PHASE_COLORS: Record<AgentTaskPhase, string> = {
  proposed: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  plan: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  build: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  escalated: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
};

export const AGENT_PRIORITY_LABELS: Record<number, string> = {
  1: '높음',
  2: '보통',
  3: '낮음',
};

// ─── Auto-Recovery Rules ───

export interface RecoveryRule {
  id: string;
  service: string;
  condition: 'errored' | 'stopped';
  action: 'restart';
  maxRetries: number;
  enabled: boolean;
}

export const RECOVERY_RULES: RecoveryRule[] = [
  { id: 'r1', service: 'make-money', condition: 'errored', action: 'restart', maxRetries: 2, enabled: true },
  { id: 'r2', service: 'kimchi-bot', condition: 'errored', action: 'restart', maxRetries: 2, enabled: true },
  { id: 'r3', service: 'tradinglab', condition: 'errored', action: 'restart', maxRetries: 2, enabled: true },
  { id: 'r4', service: 'telegram-event-bot', condition: 'errored', action: 'restart', maxRetries: 2, enabled: true },
];
