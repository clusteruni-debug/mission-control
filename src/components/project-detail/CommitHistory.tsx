'use client';

import { cn, formatRelativeDate } from '@/lib/utils';
import { Section } from './Section';

interface CommitEntry {
  sha: string;
  message: string;
  date: string;
}

interface CommitHistoryProps {
  commits: CommitEntry[];
}

export function CommitHistory({ commits }: CommitHistoryProps) {
  return (
    <Section title="최근 커밋">
      {!commits?.length ? (
        <p className="text-sm text-gray-400">커밋 기록이 없습니다</p>
      ) : (
        <div className="space-y-0">
          {commits.map((commit, i) => (
            <div
              key={commit.sha}
              className="flex items-start gap-3 border-l-2 border-gray-200 py-3 pl-4 dark:border-gray-700"
            >
              <div
                className={cn(
                  '-ml-[21px] mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full',
                  i === 0
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {commit.message}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {formatRelativeDate(commit.date)}{' '}
                  <span className="font-mono text-gray-300 dark:text-gray-600">
                    {commit.sha.slice(0, 7)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
