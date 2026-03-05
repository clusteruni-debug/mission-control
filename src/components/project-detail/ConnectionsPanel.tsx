'use client';

import Link from 'next/link';
import { Link2 } from 'lucide-react';
import { PROJECTS } from '@/lib/constants';
import { CONNECTION_TYPE_META } from '@/lib/connection-utils';
import { cn } from '@/lib/utils';
import type { ConnectionDef } from '@/types';

interface ConnectionsPanelProps {
  connections: ConnectionDef[];
}

export function ConnectionsPanel({ connections }: ConnectionsPanelProps) {
  if (!connections || connections.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
        연동된 프로젝트
      </p>
      <div className="flex flex-wrap gap-2">
        {connections.map((conn) => {
          const linked = PROJECTS.find((p) => p.folder === conn.target);
          if (!linked) return null;
          const meta = CONNECTION_TYPE_META[conn.type];
          return (
            <Link
              key={`${conn.target}-${conn.type}`}
              href={`/project/${conn.target}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <Link2 className="h-3.5 w-3.5 text-green-500" />
              {linked.name}
              <span className={cn('ml-1 rounded px-1 py-0.5 text-[10px] font-medium', meta.bg, meta.color)}>
                {meta.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
