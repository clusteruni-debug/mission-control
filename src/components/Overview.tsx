'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ServiceStatus } from '@/types/status';
import {
  FolderGit2,
  DollarSign,
  Bot,
  CalendarClock,
} from 'lucide-react';
import { QuickLaunch } from './QuickLaunch';
import { SummaryCards } from './overview/SummaryCards';
import { TrendChartSection } from './overview/TrendChartSection';
import { TimelineSection } from './overview/TimelineSection';
import { RoadmapSection } from './overview/RoadmapSection';
import { fetchTimelineItems } from './overview/timeline-utils';
import {
  extractBalanceSeries,
  extractParticipationSeries,
  extractProjectCountSeries,
} from './overview/snapshot-utils';
import type {
  OverviewProps,
  MakeMoneyOverview,
  WatchBotOverview,
  EventOverview,
  TimelineItem,
  RangeKey,
  SnapshotRow,
  SummaryCardDef,
} from './overview/types';

export function Overview({ snapshots, onNavigate }: OverviewProps) {
  // 요약 카드 데이터
  const [makeMoney, setMakeMoney] = useState<MakeMoneyOverview | null>(null);
  const [watchBot, setWatchBot] = useState<WatchBotOverview | null>(null);
  const [events, setEvents] = useState<EventOverview | null>(null);
  const [mmStatus, setMmStatus] = useState<ServiceStatus>('unknown');
  const [watchBotStatus, setWatchBotStatus] = useState<ServiceStatus>('unknown');
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

    // Watch Bot
    fetch('/api/bot-status')
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'online') {
          setWatchBot({
            status: 'online',
            success_rate: data.success_rate ?? 0,
          });
          setWatchBotStatus('online');
        } else {
          setWatchBotStatus('offline');
        }
      })
      .catch(() => setWatchBotStatus('offline'));

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
      (s.git.recentCommits ?? []).filter((c) => c.date.startsWith(todayStr)).length,
    0
  );

  // --- 추세 차트 데이터 ---

  const balanceData = extractBalanceSeries(snapshotRows);
  const participationData = extractParticipationSeries(snapshotRows);
  const projectCountData = extractProjectCountSeries(snapshotRows);

  // --- 카드 정의 ---

  const cards: SummaryCardDef[] = [
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
                value: typeof makeMoney.balance === 'number' ? `$${makeMoney.balance.toFixed(2)}` : '--',
              },
              {
                label: '총 P&L',
                value: typeof makeMoney.totalPnL === 'number'
                  ? `${makeMoney.totalPnL >= 0 ? '+' : '-'}$${Math.abs(makeMoney.totalPnL).toFixed(2)}`
                  : '--',
                color:
                  typeof makeMoney.totalPnL === 'number'
                    ? makeMoney.totalPnL >= 0
                      ? 'text-emerald-500'
                      : 'text-red-500'
                    : undefined,
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
      title: 'Watch Bot',
      tab: 'monitoring',
      icon: Bot,
      status: watchBotStatus,
      rows:
        watchBotStatus === 'online' && watchBot
          ? [
              { label: '상태', value: 'Online', color: 'text-emerald-500' },
              {
                label: '성공률',
                value: `${Math.round(watchBot.success_rate)}%`,
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
      <SummaryCards cards={cards} onNavigate={onNavigate} />

      <QuickLaunch />

      <TrendChartSection
        balanceData={balanceData}
        participationData={participationData}
        projectCountData={projectCountData}
        chartRange={chartRange}
        onRangeChange={handleRangeChange}
        chartLoading={chartLoading}
      />

      <TimelineSection timeline={timeline} loading={timelineLoading} />

      <RoadmapSection />
    </div>
  );
}
