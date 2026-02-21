'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn, formatRelativeDate } from '@/lib/utils';
import dynamic from 'next/dynamic';

const TrendChart = dynamic(() => import('./TrendChart').then(m => ({ default: m.TrendChart })), {
  ssr: false,
  loading: () => <div className="h-52 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});
import type { ProjectSnapshot } from '@/types';
import type { ServiceStatus } from '@/types/status';
import {
  FolderGit2,
  DollarSign,
  Bot,
  CalendarClock,
  GitCommit,
  Cpu,
  TrendingUp,
  Megaphone,
  Loader2,
  BarChart3,
  Target,
} from 'lucide-react';
import { PROJECTS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/constants';
import type { ProjectPriority } from '@/types';

// --- 인터페이스 ---

interface OverviewProps {
  snapshots: ProjectSnapshot[];
  onNavigate: (tab: string) => void;
}

interface MakeMoneyOverview {
  balance: number;
  totalPnL: number;
  agent: string;
}

interface OpenClawOverview {
  status: string;
  success_rate: number;
}

interface EventOverview {
  deadlineSoon: number;
  participationRate: number;
  unanalyzed: number;
}

interface TimelineItem {
  type: 'commit' | 'openclaw' | 'trade' | 'event';
  title: string;
  detail: string;
  timestamp: string;
}

type RangeKey = '24h' | '7d' | '30d';

interface TrendPoint {
  timestamp: string;
  value: number;
}

interface SnapshotRow {
  created_at: string;
  make_money: Record<string, unknown>;
  events: Record<string, unknown>;
  project_stats: Record<string, unknown>;
}

// --- 타임라인 설정 ---

const TIMELINE_META: Record<
  TimelineItem['type'],
  { Icon: typeof GitCommit; color: string; bg: string; label: string }
> = {
  commit: {
    Icon: GitCommit,
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    label: '커밋',
  },
  openclaw: {
    Icon: Cpu,
    color: 'text-purple-500 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    label: 'OpenClaw',
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

// --- 타임라인 데이터 수집 ---

async function fetchTimelineItems(): Promise<TimelineItem[]> {
  const items: TimelineItem[] = [];

  const results = await Promise.allSettled([
    fetch('/api/feed').then((r) => r.json()),
    fetch('/api/openclaw-command?path=history').then((r) => r.json()),
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

  // OpenClaw 히스토리
  if (results[1].status === 'fulfilled') {
    const res = results[1].value;
    const tasks = res?.data?.tasks ?? res?.data ?? [];
    if (Array.isArray(tasks)) {
      for (const t of tasks.slice(0, 5)) {
        if (!t.completed_at) continue;
        items.push({
          type: 'openclaw',
          title: t.project || 'task',
          detail: t.task || '',
          timestamp: t.completed_at,
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

// --- 스냅샷 → TrendChart 데이터 변환 ---

function extractBalanceSeries(rows: SnapshotRow[]): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const row of rows) {
    const mm = row.make_money as { data?: { balance?: number }; balance?: number } | null;
    const balance = mm?.data?.balance ?? mm?.balance;
    if (typeof balance === 'number') {
      points.push({ timestamp: row.created_at, value: balance });
    }
  }
  return points;
}

function extractParticipationSeries(rows: SnapshotRow[]): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const row of rows) {
    const ev = row.events as { data?: { total?: number; participated?: number } } | null;
    const total = ev?.data?.total;
    const participated = ev?.data?.participated;
    if (typeof total === 'number' && total > 0 && typeof participated === 'number') {
      points.push({
        timestamp: row.created_at,
        value: Math.round((participated / total) * 100),
      });
    }
  }
  return points;
}

function extractProjectCountSeries(rows: SnapshotRow[]): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const row of rows) {
    const ps = row.project_stats as { total?: number } | null;
    if (typeof ps?.total === 'number') {
      points.push({ timestamp: row.created_at, value: ps.total });
    }
  }
  return points;
}

// --- 컴포넌트 ---

export function Overview({ snapshots, onNavigate }: OverviewProps) {
  // 요약 카드 데이터
  const [makeMoney, setMakeMoney] = useState<MakeMoneyOverview | null>(null);
  const [openClaw, setOpenClaw] = useState<OpenClawOverview | null>(null);
  const [events, setEvents] = useState<EventOverview | null>(null);
  const [mmStatus, setMmStatus] = useState<ServiceStatus>('unknown');
  const [clawStatus, setClawStatus] = useState<ServiceStatus>('unknown');
  const [eventStatus, setEventStatus] = useState<ServiceStatus>('unknown');

  // 통합 타임라인
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(true);

  // 추세 차트
  const [chartRange, setChartRange] = useState<RangeKey>('24h');
  const [snapshotRows, setSnapshotRows] = useState<SnapshotRow[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // --- 스냅샷 데이터 로딩 ---

  const fetchSnapshots = useCallback(async (range: RangeKey) => {
    setChartLoading(true);
    try {
      const res = await fetch(`/api/snapshot?range=${range}`);
      const json = await res.json();
      const rows = json?.data ?? [];
      setSnapshotRows(Array.isArray(rows) ? rows : []);
    } catch {
      setSnapshotRows([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const handleRangeChange = useCallback(
    (range: RangeKey) => {
      setChartRange(range);
      fetchSnapshots(range);
    },
    [fetchSnapshots]
  );

  // --- 데이터 로딩 ---

  useEffect(() => {
    // Make Money
    Promise.all([
      fetch('/api/make-money?path=portfolio')
        .then((r) => r.json())
        .catch(() => null),
      fetch('/api/make-money?path=health')
        .then((r) => r.json())
        .catch(() => null),
    ]).then(([pRes, hRes]) => {
      if (pRes?.status === 'online' && pRes.data) {
        setMakeMoney({
          balance: pRes.data.balance,
          totalPnL: pRes.data.totalPnL,
          agent: hRes?.data?.agent ?? 'unknown',
        });
        setMmStatus('online');
      } else {
        setMmStatus('offline');
      }
    });

    // OpenClaw
    fetch('/api/bot-status')
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'online') {
          setOpenClaw({
            status: 'online',
            success_rate: data.success_rate ?? 0,
          });
          setClawStatus('online');
        } else {
          setClawStatus('offline');
        }
      })
      .catch(() => setClawStatus('offline'));

    // Events
    fetch('/api/telegram-bot?path=stats')
      .then((r) => r.json())
      .then((res) => {
        if (res?.status === 'online' && res.data) {
          setEvents({
            deadlineSoon: res.data.deadlineSoon ?? 0,
            participationRate: res.data.participationRate ?? 0,
            unanalyzed: res.data.unanalyzed ?? 0,
          });
          setEventStatus('online');
        } else {
          setEventStatus('offline');
        }
      })
      .catch(() => setEventStatus('offline'));

    // 통합 타임라인
    fetchTimelineItems()
      .then(setTimeline)
      .finally(() => setTimelineLoading(false));

    // 스냅샷 (추세 차트)
    fetchSnapshots('24h');
  }, [fetchSnapshots]);

  // --- 프로젝트 통계 ---

  const running = snapshots.filter(
    (s) => s.project.category === 'running'
  ).length;
  const dev = snapshots.filter(
    (s) => s.project.category === 'dev'
  ).length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCommits = snapshots.reduce(
    (sum, s) =>
      sum +
      s.git.recentCommits.filter((c) => c.date.startsWith(todayStr)).length,
    0
  );

  // --- 추세 차트 데이터 ---

  const balanceData = extractBalanceSeries(snapshotRows);
  const participationData = extractParticipationSeries(snapshotRows);
  const projectCountData = extractProjectCountSeries(snapshotRows);
  const hasAnyChartData = balanceData.length > 0 || participationData.length > 0 || projectCountData.length > 0;

  // --- 카드 정의 ---

  const cards: {
    title: string;
    tab: string;
    icon: typeof FolderGit2;
    status: ServiceStatus;
    rows: { label: string; value: string; color?: string }[];
  }[] = [
    {
      title: '프로젝트 건강',
      tab: 'projects',
      icon: FolderGit2,
      status: 'online',
      rows: [
        { label: '운영중', value: String(running) },
        { label: '개발중', value: String(dev) },
        { label: '오늘 커밋', value: String(todayCommits) },
      ],
    },
    {
      title: 'Make Money',
      tab: 'monitoring',
      icon: DollarSign,
      status: mmStatus,
      rows:
        mmStatus === 'online' && makeMoney
          ? [
              {
                label: '잔고',
                value: `$${makeMoney.balance.toFixed(2)}`,
              },
              {
                label: '총 P&L',
                value: `${makeMoney.totalPnL >= 0 ? '+' : '-'}$${Math.abs(makeMoney.totalPnL).toFixed(2)}`,
                color:
                  makeMoney.totalPnL >= 0
                    ? 'text-emerald-500'
                    : 'text-red-500',
              },
              {
                label: '에이전트',
                value: makeMoney.agent === 'running' ? 'Running' : makeMoney.agent,
                color:
                  makeMoney.agent === 'running'
                    ? 'text-emerald-500'
                    : undefined,
              },
            ]
          : [],
    },
    {
      title: 'OpenClaw',
      tab: 'openclaw',
      icon: Bot,
      status: clawStatus,
      rows:
        clawStatus === 'online' && openClaw
          ? [
              { label: '상태', value: 'Online', color: 'text-emerald-500' },
              {
                label: '성공률',
                value: `${Math.round(openClaw.success_rate)}%`,
              },
              { label: '현재', value: 'idle' },
            ]
          : [],
    },
    {
      title: '이벤트',
      tab: 'monitoring',
      icon: CalendarClock,
      status: eventStatus,
      rows:
        eventStatus === 'online' && events
          ? [
              { label: '마감 임박', value: `${events.deadlineSoon}건` },
              {
                label: '참여율',
                value: `${Math.round(events.participationRate)}%`,
              },
              { label: '미분석', value: `${events.unanalyzed}건` },
            ]
          : [],
    },
  ];

  // --- 렌더링 ---

  return (
    <div className="space-y-6">
      {/* 4개 요약 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => onNavigate(card.tab)}
            className="rounded-xl border border-gray-200 bg-white p-5 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className="mb-3 flex items-center gap-2">
              <card.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {card.title}
              </h3>
              <span
                className={cn(
                  'ml-auto h-2 w-2 rounded-full',
                  card.status === 'online'
                    ? 'bg-emerald-500'
                    : card.status === 'offline'
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                )}
              />
            </div>
            {card.rows.length > 0 ? (
              <div className="space-y-1.5">
                {card.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-500 dark:text-gray-400">
                      {row.label}
                    </span>
                    <span
                      className={cn(
                        'font-semibold',
                        row.color ??
                          'text-gray-900 dark:text-gray-100'
                      )}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-2 text-center text-xs text-gray-400 dark:text-gray-500">
                오프라인
              </p>
            )}
          </button>
        ))}
      </div>

      {/* 추세 차트 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            추세 차트
          </h3>
        </div>
        {!hasAnyChartData && !chartLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              데이터 수집 시작 후 표시됩니다
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              스냅샷 수집기가 실행되면 자동 활성화됩니다
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <TrendChart
              data={balanceData}
              label="포트폴리오 가치"
              color="blue"
              range={chartRange}
              onRangeChange={handleRangeChange}
              valuePrefix="$"
              loading={chartLoading}
            />
            <TrendChart
              data={participationData}
              label="이벤트 참여율"
              color="amber"
              range={chartRange}
              onRangeChange={handleRangeChange}
              valueSuffix="%"
              loading={chartLoading}
            />
            <TrendChart
              data={projectCountData}
              label="프로젝트 수"
              color="purple"
              range={chartRange}
              onRangeChange={handleRangeChange}
              loading={chartLoading}
            />
          </div>
        )}
      </div>

      {/* 통합 타임라인 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          통합 타임라인
        </h2>

        {timelineLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              활동 데이터 로딩 중...
            </span>
          </div>
        ) : timeline.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            아직 활동이 없습니다
          </p>
        ) : (
          <div className="space-y-0">
            {timeline.map((item, i) => {
              const meta = TIMELINE_META[item.type];
              return (
                <div
                  key={`${item.type}-${item.timestamp}-${i}`}
                  className="flex items-start gap-3 border-l-2 border-gray-200 py-2.5 pl-4 dark:border-gray-700"
                >
                  <div
                    className={cn(
                      '-ml-[21px] mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                      meta.bg
                    )}
                  >
                    <meta.Icon className={cn('h-3 w-3', meta.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-xs font-medium',
                          meta.bg,
                          meta.color
                        )}
                      >
                        {meta.label}
                      </span>
                      <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                        {item.title}
                      </span>
                      <span className="ml-auto shrink-0 text-xs text-gray-400 dark:text-gray-500">
                        {formatRelativeDate(item.timestamp)}
                      </span>
                    </div>
                    {item.detail && (
                      <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-400">
                        {item.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 프로젝트 로드맵 요약 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            프로젝트 로드맵
          </h3>
        </div>
        <div className="space-y-3">
          {(['high', 'medium', 'low', 'maintenance'] as ProjectPriority[]).map((priority) => {
            const projects = PROJECTS.filter((p) => p.priority === priority);
            if (projects.length === 0) return null;
            return (
              <div key={priority}>
                <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {PRIORITY_LABELS[priority]}
                </p>
                <div className="space-y-2">
                  {projects.map((p) => (
                    <div
                      key={p.folder}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800"
                    >
                      <span className="w-28 truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                        {p.name}
                      </span>
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', PRIORITY_COLORS[priority])}>
                        {p.phase ?? '—'}
                      </span>
                      <div className="flex-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              (p.completionPct ?? 0) >= 80
                                ? 'bg-green-500'
                                : (p.completionPct ?? 0) >= 50
                                  ? 'bg-blue-500'
                                  : 'bg-yellow-500'
                            )}
                            style={{ width: `${p.completionPct ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-8 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {p.completionPct ?? 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
