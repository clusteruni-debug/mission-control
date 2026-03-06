import type { ProjectConfig, ServiceCategory, ServiceRuntime, IncidentSeverity, IncidentStatus } from '@/types';

// 워크스페이스 프로젝트 정의
export const GITHUB_OWNER = 'clusteruni-debug';

export const PROJECTS: ProjectConfig[] = [
  {
    name: 'Navigator',
    folder: 'To-do-list-for-adhd',
    repo: 'To-do-list-for-adhd',
    description: 'ADHD 맞춤 할 일 관리 + 라이프 리듬 + 캘린더',
    techStack: ['HTML', 'Vanilla JS', 'Firebase'],
    category: 'running',
    deployUrl: 'https://clusteruni-debug.github.io/To-do-list-for-adhd/navigator-v5.html',
    platform: 'windows',
    runCmd: 'npx serve -p 5000',
    port: 5000,
    connections: [
      { target: 'telegram-event-bot', type: 'api-direct', label: 'Supabase REST read' },
      { target: 'x-article-editor', type: 'url-handoff' },
    ],
    phase: '운영 중 — 지속적 UX 개선',
    completionPct: 85,
    nextTasks: ['PC 최적화', 'Firebase 동기화 핑퐁 방지 검증'],
    priority: 'medium',
  },
  {
    name: 'Kimchi Premium',
    folder: 'kimchi-premium',
    repo: 'Kimpbotforme',
    description: '크립토 김치 프리미엄 모니터링',
    techStack: ['React', 'Vite', 'WebSocket', 'Python', 'SQLite'],
    category: 'running',
    platform: 'windows',
    runCmd: 'cd react-app && npx vite --port 5100',
    port: 5100,
    connections: [
      { target: 'make-money-project', type: 'supabase-shared', label: 'Instance #2' },
    ],
    phase: '기능 완성 — 페이퍼 통계 분석 대기',
    completionPct: 75,
    nextTasks: ['transfer vs dual_exchange 전략 성과 비교', '전략별 수익률 대시보드'],
    priority: 'maintenance',
  },
  {
    name: '자산관리',
    folder: '자산관리',
    repo: 'web3-budget-app',
    description: '자산 관리 + 가계부',
    techStack: ['Vite', 'Vanilla JS', 'Supabase', 'Chart.js'],
    category: 'running',
    deployUrl: 'https://web3-budget-app.vercel.app/',
    platform: 'windows',
    runCmd: 'npx vite --port 5140',
    port: 5140,
    connections: [
      { target: 'kimchi-premium', type: 'shared-instance', label: 'Instance #2' },
    ],
    phase: '운영 중 — CSS 전면 개선 완료',
    completionPct: 88,
    nextTasks: ['저사양 backdrop-filter 테스트', 'Supabase 스키마 문서화'],
    priority: 'medium',
  },
  {
    name: 'Telegram Bot',
    folder: 'telegram-event-bot',
    repo: 'telegram-event-bot',
    description: '텔레그램 이벤트 알림 봇 (Bot→WSL, Web→Vercel)',
    techStack: ['Python', 'Flask', 'Supabase'],
    category: 'running',
    deployUrl: 'https://telegram-event-bot-ashy.vercel.app',
    platform: 'wsl',
    runCmd: 'systemctl --user status telegram-event-bot',
    connections: [
      { target: 'To-do-list-for-adhd', type: 'api-direct' },
      { target: 'x-article-editor', type: 'supabase-shared', label: 'Instance #1' },
    ],
    phase: '운영 중 — 분류 고도화 + 하이퍼링크 파싱',
    completionPct: 82,
    nextTasks: ['분류 정확도 모니터링', 'WSL↔Win 파일 동기화'],
    priority: 'maintenance',
  },
  {
    name: 'Baby Care',
    folder: 'baby-care',
    repo: 'baby-care',
    description: '아기 케어 기록 앱',
    techStack: ['Next.js', 'TypeScript', 'Firebase', 'Tailwind'],
    category: 'running',
    deployUrl: 'https://baby-care-gilt.vercel.app/',
    platform: 'windows',
    runCmd: 'npx next dev --turbopack -p 3020',
    port: 3020,
    phase: '기능 완성 — 안정화 운영',
    completionPct: 87,
    nextTasks: ['Firebase Security Rules 검증', 'PWA 오프라인 점검'],
    priority: 'low',
  },
  {
    name: 'Article Editor',
    folder: 'x-article-editor',
    repo: 'article-editor',
    description: 'X 아티클 작성 에디터',
    techStack: ['Next.js', 'Supabase', 'TipTap', 'Gemini AI'],
    category: 'running',
    deployUrl: 'https://article-editor-ruddy.vercel.app/',
    platform: 'windows',
    runCmd: 'npx next dev -p 3010',
    port: 3010,
    connections: [
      { target: 'To-do-list-for-adhd', type: 'url-handoff' },
      { target: 'telegram-event-bot', type: 'supabase-shared', label: 'Instance #1' },
    ],
    phase: '운영 중 — UX 지속 개선',
    completionPct: 85,
    nextTasks: ['휴지통 페이지네이션', '분류 정확도 모니터링'],
    priority: 'low',
  },
  {
    name: 'Text RPG',
    folder: 'text-rpg',
    repo: 'ramgtd-text-rpg',
    description: '텍스트 기반 RPG 게임',
    techStack: ['Vite', 'Vanilla JS'],
    category: 'dev',
    platform: 'windows',
    runCmd: 'npx vite --port 5120',
    port: 5120,
    phase: 'v0.9.0 — 콘텐츠 확장 (217씬)',
    completionPct: 72,
    nextTasks: ['동료 10명 확장', '이미지/오디오 추가', '밸런싱'],
    priority: 'low',
  },
  {
    name: 'Portfolio',
    folder: 'portfolio',
    repo: 'portfolio',
    description: '포트폴리오 사이트',
    techStack: ['Vite', 'React', 'TypeScript', 'Tailwind', 'Framer Motion'],
    category: 'running',
    deployUrl: 'https://clusteruni-debug.github.io/portfolio/',
    platform: 'windows',
    runCmd: 'npx vite --port 5110',
    port: 5110,
    phase: '운영 중 — 콘텐츠 갱신',
    completionPct: 80,
    nextTasks: ['스크린샷 교체', 'Hero 줄바꿈 개선', '모바일 반응형 점검'],
    priority: 'medium',
  },
  {
    name: 'Saitama Training',
    folder: 'Saitama-training',
    repo: 'Saitama-training',
    description: '사이타마 트레이닝 추적',
    techStack: ['React', 'TypeScript', 'Firebase', 'Zustand', 'Tailwind'],
    category: 'running',
    deployUrl: 'https://clusteruni-debug.github.io/Saitama-training/',
    platform: 'windows',
    runCmd: 'npx vite --port 5130',
    port: 5130,
    phase: 'P0~P2 완료 — PWA 운영',
    completionPct: 88,
    nextTasks: ['Firebase 동기화 검증', 'RPE 볼륨 자동 조절 확인'],
    priority: 'low',
  },
  {
    name: 'Make Money',
    folder: 'make-money-project',
    repo: 'make-money-project',
    description: '크립토 AI 자동매매 봇 + 운영 대시보드',
    techStack: ['Node.js', 'Express', 'React', 'SQLite', 'Claude AI'],
    category: 'running',
    platform: 'windows',
    runCmd: 'cd server && node index.js',
    port: 3001,
    connections: [
      { target: 'kimchi-premium', type: 'supabase-shared', label: 'Instance #2' },
    ],
    phase: '실거래 운영 — 5엔진 활성 + recovery 전략',
    completionPct: 78,
    nextTasks: ['recovery 20건 성과 평가', '$50 시 balanced 전환', 'evaluateMarketSignal 리팩토링'],
    priority: 'high',
  },
  {
    name: 'WatchBot',
    folder: 'claude-code-bot',
    repo: 'openclaw-bot',
    description: '텔레그램 통합 커맨더 (정지 중 — 재활용 예정)',
    techStack: ['Python', 'python-telegram-bot', 'Claude Agent SDK', 'SQLite'],
    category: 'stopped',
    platform: 'wsl',
    runCmd: 'cd /mnt/c/vibe/projects/claude-code-bot && python bot.py',
    phase: '정지 — 통합 커맨더로 재활용 계획',
    completionPct: 83,
    nextTasks: ['통합 커맨더 기획', 'PM2 모니터링 모듈', 'MC 연동 대시보드'],
    priority: 'low',
  },
  {
    name: 'Claude Skills',
    folder: 'Claude-skills',
    repo: 'Claude-skills',
    description: 'Claude Code 커스텀 스킬 모음',
    techStack: ['Shell', 'Markdown'],
    category: 'tool',
    platform: 'both',
    runCmd: './setup.sh',
    phase: '운영중',
    completionPct: 90,
    nextTasks: ['스킬 카탈로그 정리'],
    priority: 'maintenance',
  },
  {
    name: 'TRADINGLAB',
    folder: 'coin-test-project',
    repo: 'coin-test-project',
    description: '크립토 트레이딩 실험실',
    techStack: ['Python', 'pandas', 'ccxt', 'optuna', 'Jinja2'],
    category: 'dev',
    platform: 'windows',
    runCmd: 'python -m tradinglab dashboard',
    port: 8787,
    phase: '연구/백테스트 — 제약 검증 추가',
    completionPct: 65,
    nextTasks: ['feasible 판정 호출부 연결', '새 전략 플러그인 추가'],
    priority: 'medium',
  },
  {
    name: 'AI Hub',
    folder: 'ai-hub',
    repo: 'ai-hub',
    description: 'Multi-AI LLM 서비스 허브 + 대화 관리 대시보드',
    techStack: ['Electron', 'Vanilla JS', 'Supabase'],
    category: 'tool',
    platform: 'windows',
    runCmd: 'npx electron-vite dev',
    port: 5150,
    connections: [
      { target: 'ai-hub-extension', type: 'chrome-extension' },
    ],
    phase: 'v0.3.0 — Lazy Loading + 분석 리포트',
    completionPct: 80,
    nextTasks: ['리포트 가져오기 실사용 테스트', 'MCP 연동 Phase 2'],
    priority: 'medium',
  },
  {
    name: 'AI Hub Extension',
    folder: 'ai-hub-extension',
    repo: 'ai-hub-extension',
    description: 'AI Hub Chrome 확장 — 본문 저장 + 중복 감지',
    techStack: ['Chrome Extension MV3', 'Supabase', 'esbuild'],
    category: 'tool',
    platform: 'windows',
    connections: [
      { target: 'ai-hub', type: 'chrome-extension' },
    ],
    phase: '초기 개발 — Grok/AskSurf 추가, 실테스트 대기',
    completionPct: 55,
    nextTasks: ['Gemini/Grok/AskSurf 실제 저장 테스트', 'Chrome Web Store 배포'],
    priority: 'medium',
  },
  {
    name: 'Mission Control',
    folder: 'mission-control',
    repo: 'mission-control',
    description: '워크스페이스 프로젝트 관제 대시보드',
    techStack: ['Next.js', 'TypeScript', 'Supabase', 'recharts'],
    category: 'tool',
    deployUrl: 'https://mission-control-psi-smoky.vercel.app',
    platform: 'windows',
    runCmd: 'npm run dev',
    port: 3000,
    connections: [
      { target: 'make-money-project', type: 'api-proxy' },
      { target: 'telegram-event-bot', type: 'api-proxy' },
      { target: 'kimchi-premium', type: 'api-proxy' },
      { target: 'ai-hub', type: 'api-proxy' },
    ],
    phase: 'Phase 1-4 완료 — 서비스 모니터링 확장',
    completionPct: 82,
    nextTasks: ['mc_snapshots 테이블 생성', '스냅샷 수집 스케줄러'],
    priority: 'medium',
  },
];

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

export interface ServiceRegistryEntry {
  name: string;
  runtime: ServiceRuntime;
  category: ServiceCategory;
  projectFolder?: string;
  port?: number;
  autorestart: boolean;
  protected: boolean;
}

export const SERVICE_REGISTRY: ServiceRegistryEntry[] = [
  // Always-on (autorestart: true)
  { name: 'make-money', runtime: 'pm2', category: 'always-on', projectFolder: 'make-money-project', port: 3001, autorestart: true, protected: true },
  { name: 'kimchi-bot', runtime: 'pm2', category: 'always-on', projectFolder: 'kimchi-premium', autorestart: true, protected: false },
  { name: 'tradinglab', runtime: 'pm2', category: 'always-on', projectFolder: 'coin-test-project', port: 8787, autorestart: true, protected: false },

  // Dev servers (autorestart: false)
  { name: 'make-money-ui', runtime: 'pm2', category: 'dev-server', projectFolder: 'make-money-project', port: 3002, autorestart: false, protected: false },
  { name: 'mission-control', runtime: 'pm2', category: 'dev-server', projectFolder: 'mission-control', port: 3000, autorestart: false, protected: false },
  { name: 'x-article-editor', runtime: 'pm2', category: 'dev-server', projectFolder: 'x-article-editor', port: 3010, autorestart: false, protected: false },
  { name: 'baby-care', runtime: 'pm2', category: 'dev-server', projectFolder: 'baby-care', port: 3020, autorestart: false, protected: false },
  { name: 'navigator', runtime: 'pm2', category: 'dev-server', projectFolder: 'todolist', port: 5000, autorestart: false, protected: false },
  { name: 'kimchi-premium', runtime: 'pm2', category: 'dev-server', projectFolder: 'kimchi-premium', port: 5100, autorestart: false, protected: false },
  { name: 'portfolio', runtime: 'pm2', category: 'dev-server', projectFolder: 'portfolio', port: 5110, autorestart: false, protected: false },
  { name: 'text-rpg', runtime: 'pm2', category: 'dev-server', projectFolder: 'text-rpg', port: 5120, autorestart: false, protected: false },
  { name: 'saitama-training', runtime: 'pm2', category: 'dev-server', projectFolder: 'Saitama-training', port: 5130, autorestart: false, protected: false },
  { name: 'asset-manager', runtime: 'pm2', category: 'dev-server', projectFolder: '자산관리', port: 5140, autorestart: false, protected: false },
  { name: 'ai-hub', runtime: 'pm2', category: 'dev-server', projectFolder: 'ai-hub', port: 5150, autorestart: false, protected: false },
  { name: 'telegram-bot', runtime: 'pm2', category: 'dev-server', projectFolder: 'telegram-event-bot', autorestart: false, protected: false },
  { name: 'telegram-web', runtime: 'pm2', category: 'dev-server', projectFolder: 'telegram-event-bot', port: 5002, autorestart: false, protected: false },

  // Paper trading
  { name: 'tradinglab-paper-day', runtime: 'pm2', category: 'paper-trading', projectFolder: 'coin-test-project', autorestart: false, protected: false },
  { name: 'tradinglab-paper-scalp', runtime: 'pm2', category: 'paper-trading', projectFolder: 'coin-test-project', autorestart: false, protected: false },

  // WSL systemd services
  { name: 'telegram-event-bot', runtime: 'wsl-systemd', category: 'wsl', autorestart: true, protected: false },
];

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
  { id: 'supabase-1', name: 'Supabase #1 (hgygyilcr...)', projects: ['x-article-editor', 'mission-control', 'ai-hub', 'telegram-event-bot'], tableCount: 13 },
  { id: 'supabase-2', name: 'Supabase #2 (mrgbwlhhn...)', projects: ['자산관리', 'kimchi-premium', 'make-money-project'], tableCount: 17 },
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
