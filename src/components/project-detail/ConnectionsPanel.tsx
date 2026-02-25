'use client';

import Link from 'next/link';
import { Link2 } from 'lucide-react';
import { PROJECTS } from '@/lib/constants';

interface ConnectionsPanelProps {
  connections: string[];
}

export function ConnectionsPanel({ connections }: ConnectionsPanelProps) {
  if (!connections || connections.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
        연동된 프로젝트
      </p>
      <div className="flex flex-wrap gap-2">
        {connections.map((folder) => {
          const linked = PROJECTS.find((p) => p.folder === folder);
          if (!linked) return null;
          return (
            <Link
              key={folder}
              href={`/project/${folder}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <Link2 className="h-3.5 w-3.5 text-green-500" />
              {linked.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
