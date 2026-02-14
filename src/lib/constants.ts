// 워크스페이스 프로젝트 정의
export const GITHUB_OWNER = 'clusteruni-debug';

export interface ProjectConfig {
  name: string;
  folder: string;
  repo: string; // GitHub 레포 이름
  description: string;
  techStack: string[];
  category: 'running' | 'dev' | 'legacy' | 'tool';
  deployUrl?: string;
  connections?: string[]; // 연동된 프로젝트 folder 목록
}

export const PROJECTS: ProjectConfig[] = [
  {
    name: 'Navigator',
    folder: 'To-do-list-for-adhd',
    repo: 'To-do-list-for-adhd',
    description: 'ADHD 맞춤 할 일 관리 + 라이프 리듬',
    techStack: ['HTML', 'Vanilla JS', 'Firebase'],
    category: 'running',
    connections: ['telegram-event-bot', 'web3-budget-app', 'article-editor'],
  },
  {
    name: 'Kimchi Premium',
    folder: 'Kimpbotforme',
    repo: 'Kimpbotforme',
    description: '크립토 김치 프리미엄 모니터링',
    techStack: ['Supabase', '거래소 API'],
    category: 'running',
  },
  {
    name: 'Web3 가계부',
    folder: 'web3-budget-app',
    repo: 'web3-budget-app',
    description: '자산 관리 + 가계부',
    techStack: ['Vite', 'Vanilla JS', 'Supabase'],
    category: 'running',
    connections: ['To-do-list-for-adhd'],
  },
  {
    name: 'Telegram Bot',
    folder: 'telegram-event-bot',
    repo: 'telegram-event-bot',
    description: '텔레그램 이벤트 알림 봇',
    techStack: ['Node.js', 'Telegram API'],
    category: 'running',
    connections: ['To-do-list-for-adhd'],
  },
  {
    name: 'Baby Care',
    folder: 'baby-care',
    repo: 'baby-care',
    description: '아기 케어 기록 앱',
    techStack: ['Next.js', 'TypeScript', 'Firebase'],
    category: 'dev',
  },
  {
    name: 'Article Editor',
    folder: 'article-editor',
    repo: 'article-editor',
    description: 'X 아티클 작성 에디터',
    techStack: ['Next.js', 'Supabase', 'TipTap'],
    category: 'dev',
    connections: ['To-do-list-for-adhd'],
  },
  {
    name: 'Text RPG',
    folder: 'ramgtd-text-rpg',
    repo: 'ramgtd-text-rpg',
    description: '텍스트 기반 RPG 게임',
    techStack: ['Vite', 'Vanilla JS'],
    category: 'dev',
  },
  {
    name: 'Portfolio',
    folder: 'portfolio',
    repo: 'portfolio',
    description: '포트폴리오 사이트',
    techStack: ['Vite', 'React', 'TypeScript'],
    category: 'dev',
  },
  {
    name: 'Saitama Training',
    folder: 'saitama-training',
    repo: 'Saitama-training',
    description: '사이타마 트레이닝 추적',
    techStack: ['React', 'TypeScript', 'Firebase', 'Zustand'],
    category: 'dev',
  },
  {
    name: 'Claude Skills',
    folder: 'Claude-skills',
    repo: 'Claude-skills',
    description: 'Claude Code 커스텀 스킬 모음',
    techStack: ['Shell', 'Markdown'],
    category: 'tool',
  },
  {
    name: 'Mission Control',
    folder: 'mission-control',
    repo: 'mission-control',
    description: '워크스페이스 프로젝트 관제 대시보드',
    techStack: ['Next.js', 'TypeScript', 'Supabase'],
    category: 'tool',
    deployUrl: 'https://mission-control-psi-smoky.vercel.app',
  },
];

export const CATEGORY_LABELS: Record<ProjectConfig['category'], string> = {
  running: '운영중',
  dev: '개발중',
  legacy: '레거시',
  tool: '도구',
};

export const CATEGORY_COLORS: Record<ProjectConfig['category'], string> = {
  running: 'bg-green-500',
  dev: 'bg-blue-500',
  legacy: 'bg-gray-500',
  tool: 'bg-purple-500',
};
