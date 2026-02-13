'use client';

import { PROJECTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ArrowRight, Link2 } from 'lucide-react';

interface Connection {
  from: string;
  to: string;
  fromName: string;
  toName: string;
  status: 'active' | 'planned';
}

// 연동 상태 정의
const CONNECTION_STATUS: Record<string, 'active' | 'planned'> = {
  'To-do-list-for-adhd→telegram-event-bot': 'active',
  'To-do-list-for-adhd→web3-budget-app': 'active',
  'To-do-list-for-adhd→article-editor': 'planned',
};

export function ConnectionMap() {
  // 프로젝트 설정에서 연동 정보 수집
  const connections: Connection[] = [];
  const seen = new Set<string>();

  for (const project of PROJECTS) {
    if (!project.connections) continue;
    for (const targetFolder of project.connections) {
      const key = [project.folder, targetFolder].sort().join('↔');
      if (seen.has(key)) continue;
      seen.add(key);

      const target = PROJECTS.find((p) => p.folder === targetFolder);
      if (!target) continue;

      const statusKey = `${project.folder}→${targetFolder}`;
      const statusKeyReverse = `${targetFolder}→${project.folder}`;
      const status =
        CONNECTION_STATUS[statusKey] ??
        CONNECTION_STATUS[statusKeyReverse] ??
        'active';

      connections.push({
        from: project.folder,
        to: targetFolder,
        fromName: project.name,
        toName: target.name,
        status,
      });
    }
  }

  if (connections.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">
        프로젝트 간 연동이 없습니다
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {connections.map((conn) => (
        <div
          key={`${conn.from}-${conn.to}`}
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
        >
          <Link2
            className={cn(
              'h-4 w-4 flex-shrink-0',
              conn.status === 'active'
                ? 'text-green-500'
                : 'text-yellow-500'
            )}
          />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {conn.fromName}
          </span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {conn.toName}
          </span>
          <span
            className={cn(
              'ml-auto rounded-full px-2 py-0.5 text-xs font-medium',
              conn.status === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            )}
          >
            {conn.status === 'active' ? '연동중' : '계획중'}
          </span>
        </div>
      ))}
    </div>
  );
}
