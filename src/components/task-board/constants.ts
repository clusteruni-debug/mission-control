import type { TaskType } from '@/types';

export interface TypeBadgeMeta {
  label: string;
  color: string;
}

export const TYPE_BADGE: Record<TaskType, TypeBadgeMeta> = {
  task: { label: '작업', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  backlog: { label: '백로그', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  bug: { label: '버그', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  feature: { label: '기능', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  'integration-idea': { label: '연동 아이디어', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  maintenance: { label: '유지보수', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' },
};

export const TASK_TYPES: TaskType[] = ['task', 'backlog', 'bug', 'feature', 'integration-idea', 'maintenance'];
