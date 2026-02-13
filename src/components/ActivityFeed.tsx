'use client';

import { useState, useEffect } from 'react';
import { formatRelativeDate, cn } from '@/lib/utils';
import type { FeedResult, FeedItem } from '@/types';
import { GitCommit, Loader2 } from 'lucide-react';

export function ActivityFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feed')
      .then((res) => res.json())
      .then((data: FeedResult) => setFeed(data.feed))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">
        커밋 기록이 없습니다
      </p>
    );
  }

  // 날짜별 그룹핑
  const grouped = groupByDate(feed);

  return (
    <div className="space-y-6">
      {grouped.map(({ date, items }) => (
        <div key={date}>
          <p className="mb-2 text-xs font-medium text-gray-400 dark:text-gray-500">
            {date}
          </p>
          <div className="space-y-0">
            {items.map((item, i) => (
              <div
                key={`${item.sha}-${i}`}
                className="flex items-start gap-3 border-l-2 border-gray-200 py-2 pl-4 dark:border-gray-700"
              >
                <div className="-ml-[21px] mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {item.project}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatRelativeDate(item.date)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-200">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByDate(feed: FeedItem[]): { date: string; items: FeedItem[] }[] {
  const groups: Record<string, FeedItem[]> = {};

  for (const item of feed) {
    const d = new Date(item.date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let label: string;
    if (d.toDateString() === today.toDateString()) {
      label = '오늘';
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = '어제';
    } else {
      label = d.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }

  return Object.entries(groups).map(([date, items]) => ({ date, items }));
}
