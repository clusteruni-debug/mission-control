import {
  GitCommit,
  Cpu,
  TrendingUp,
  Megaphone,
} from 'lucide-react';
import type { TimelineItem } from './types';

// --- Timeline metadata ---

export const TIMELINE_META: Record<
  TimelineItem['type'],
  { Icon: typeof GitCommit; color: string; bg: string; label: string }
> = {
  commit: {
    Icon: GitCommit,
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    label: '커밋',
  },
  watchbot: {
    Icon: Cpu,
    color: 'text-purple-500 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    label: 'Watch Bot',
  },
  trade: {
    Icon: TrendingUp,
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    label: '거래',
  },
  event: {
    Icon: Megaphone,
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    label: '이벤트',
  },
};

// --- Timeline data fetching ---

export async function fetchTimelineItems(): Promise<TimelineItem[]> {
  const items: TimelineItem[] = [];

  const results = await Promise.allSettled([
    fetch('/api/feed').then((r) => r.json()),
    fetch('/api/bot-status').then((r) => r.json()),
    fetch('/api/make-money?path=trades').then((r) => r.json()),
    fetch('/api/telegram-bot?path=analyzed').then((r) => r.json()),
  ]);

  // 커밋
  if (results[0].status === 'fulfilled') {
    const feed = results[0].value?.feed;
    if (Array.isArray(feed)) {
      for (const c of feed.slice(0, 10)) {
        if (!c.date) continue;
        items.push({
          type: 'commit',
          title: c.project || c.repo || 'unknown',
          detail: c.message || '',
          timestamp: c.date,
        });
      }
    }
  }

  // Watch Bot 최근 작업
  if (results[1].status === 'fulfilled') {
    const res = results[1].value;
    const tasks = res?.recent_tasks ?? [];
    if (Array.isArray(tasks)) {
      for (const t of tasks.slice(0, 5)) {
        if (!t.timestamp) continue;
        items.push({
          type: 'watchbot',
          title: 'Watch Bot',
          detail: t.task || '',
          timestamp: t.timestamp,
        });
      }
    }
  }

  // Make Money 거래
  if (results[2].status === 'fulfilled') {
    const res = results[2].value;
    const trades = res?.data ?? [];
    if (Array.isArray(trades)) {
      for (const t of trades.slice(0, 5)) {
        const ts = t.close_timestamp || t.entry_timestamp;
        if (!ts) continue;
        const pnl = (Number(t.exit_proceeds) || 0) - (Number(t.filled_cost) || 0);
        const pnlStr = `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`;
        items.push({
          type: 'trade',
          title: t.symbol || t.market || 'Trade',
          detail: `${t.side || ''} ${pnlStr}`.trim(),
          timestamp: new Date(typeof ts === 'number' ? ts : ts).toISOString(),
        });
      }
    }
  }

  // Telegram 이벤트
  if (results[3].status === 'fulfilled') {
    const res = results[3].value;
    const events = res?.data ?? [];
    if (Array.isArray(events)) {
      for (const e of events.slice(0, 5)) {
        if (!e.deadline) continue;
        items.push({
          type: 'event',
          title: String(e.content || '이벤트').slice(0, 50),
          detail: e.participated ? '참여 완료' : `마감: ${new Date(e.deadline).toLocaleDateString('ko-KR')}`,
          timestamp: e.deadline,
        });
      }
    }
  }

  return items
    .filter((i) => i.timestamp && !isNaN(new Date(i.timestamp).getTime()))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);
}
