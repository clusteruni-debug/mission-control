'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Pause, Play } from 'lucide-react';
import { useServiceLogs } from '@/hooks/useServiceControl';

interface ServiceLogViewerProps {
  name: string;
}

export function ServiceLogViewer({ name }: ServiceLogViewerProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { stdout, stderr, loading, refresh } = useServiceLogs(name, autoRefresh);
  const preRef = useRef<HTMLPreElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [stdout, stderr]);

  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-950 dark:border-gray-700">
      <div className="flex items-center justify-between border-b border-gray-800 px-3 py-1.5">
        <span className="text-xs font-medium text-gray-400">로그</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            title={autoRefresh ? '자동 새로고침 중지' : '자동 새로고침 시작'}
          >
            {autoRefresh ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </button>
          <button
            onClick={refresh}
            className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            title="새로고침"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <pre
        ref={preRef}
        className="max-h-60 overflow-auto px-3 py-2 font-mono text-xs leading-5"
      >
        {stdout && (
          <span className="text-green-400">{stdout}</span>
        )}
        {stderr && (
          <span className="text-red-400">{stderr}</span>
        )}
        {!stdout && !stderr && (
          <span className="text-gray-500">(로그 없음)</span>
        )}
      </pre>
    </div>
  );
}
