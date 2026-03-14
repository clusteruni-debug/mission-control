export type FilterCategory = 'all' | 'running' | 'dev' | 'tool' | 'stopped';

export type TabView =
  | 'overview'
  | 'projects'
  | 'monitoring'
  | 'services'
  | 'operations'
  | 'activity'
  | 'doc-health';

export const FILTERS: { label: string; value: FilterCategory }[] = [
  { label: '전체', value: 'all' },
  { label: '운영중', value: 'running' },
  { label: '개발중', value: 'dev' },
  { label: '도구', value: 'tool' },
  { label: '정지', value: 'stopped' },
];

export const TABS: { label: string; value: TabView }[] = [
  { label: 'Overview', value: 'overview' },
  { label: '프로젝트', value: 'projects' },
  { label: '모니터링', value: 'monitoring' },
  { label: '서비스', value: 'services' },
  { label: '운영', value: 'operations' },
  { label: '활동', value: 'activity' },
  { label: 'Doc Health', value: 'doc-health' },
];

export const AUTO_REFRESH_MS = 60_000; // 60초
