'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ProjectCard } from './ProjectCard';
import { StatsBar } from './StatsBar';
import { ActivityFeed } from './ActivityFeed';
import { ProductivityStats } from './ProductivityStats';
import { ConnectionMap } from './ConnectionMap';
import { TaskBoard } from './TaskBoard';
import { MakeMoneyWidget } from './MakeMoneyWidget';
import { EventWidget } from './EventWidget';
import { OpenClawControl } from './OpenClawControl';
import { Overview } from './Overview';
import { CommandPalette } from './CommandPalette';
import { NotificationBanner } from './NotificationBanner';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotifications } from '@/hooks/useNotifications';
import type { ProjectSnapshot, ScanResult } from '@/types';
import { RefreshCw, Loader2 } from 'lucide-react';

const AUTO_REFRESH_MS = 60_000; // 60초

type FilterCategory = 'all' | 'running' | 'dev' | 'legacy' | 'tool';
type TabView =
  | 'overview'
  | 'projects'
  | 'monitoring'
  | 'openclaw'
  | 'feed'
  | 'stats'
  | 'connections'
  | 'board';

export function Dashboard() {
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [scannedAt, setScannedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_MS / 1000);
  const countdownRef = useRef(AUTO_REFRESH_MS / 1000);

  // --- Notifications ---

  const notificationConfig = useMemo(
    () => ({
      makeMoneyLossThreshold: -10,
      serviceDownAlert: true,
      enabled: true,
    }),
    []
  );

  const { notifications, dismiss } = useNotifications(notificationConfig);

  // --- Keyboard Shortcuts ---

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scan');
      const data: ScanResult = await res.json();
      setSnapshots(data.snapshots);
      setScannedAt(data.scannedAt);
    } catch (err) {
      console.error('스캔 데이터 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const shortcutConfig = useMemo(
    () => ({
      onTabChange: (tab: string) => setActiveTab(tab as TabView),
      onRefresh: () => fetchData(),
      onCommandPalette: () => setPaletteOpen((v) => !v),
    }),
    [fetchData]
  );

  useKeyboardShortcuts(shortcutConfig);

  // --- CommandPalette action handler ---

  const handlePaletteAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'quick_make_money_balance':
          setActiveTab('monitoring');
          break;
        case 'quick_openclaw_status':
          setActiveTab('openclaw');
          break;
        case 'quick_event_participation':
          setActiveTab('monitoring');
          break;
        case 'focus_openclaw_command':
          setActiveTab('openclaw');
          break;
        case 'refresh_all':
          fetchData();
          break;
      }
    },
    [fetchData]
  );

  // --- 초기 로딩 ---

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 자동 새로고침 (60초) ---

  useEffect(() => {
    countdownRef.current = AUTO_REFRESH_MS / 1000;
    setCountdown(AUTO_REFRESH_MS / 1000);

    const tick = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);
      if (countdownRef.current <= 0) {
        fetchData();
        setRefreshKey((k) => k + 1);
        countdownRef.current = AUTO_REFRESH_MS / 1000;
        setCountdown(AUTO_REFRESH_MS / 1000);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [fetchData]);

  // --- 필터/정렬 ---

  const filtered =
    filter === 'all'
      ? snapshots
      : snapshots.filter((s) => s.project.category === filter);

  const sorted = [...filtered].sort((a, b) => {
    const catOrder = { running: 0, dev: 1, tool: 2, legacy: 3 };
    const catDiff =
      catOrder[a.project.category] - catOrder[b.project.category];
    if (catDiff !== 0) return catDiff;
    const aDays = a.git.daysSinceCommit ?? 999;
    const bDays = b.git.daysSinceCommit ?? 999;
    return bDays - aDays;
  });

  const filters: { label: string; value: FilterCategory }[] = [
    { label: '전체', value: 'all' },
    { label: '운영중', value: 'running' },
    { label: '개발중', value: 'dev' },
    { label: '도구', value: 'tool' },
  ];

  const tabs: { label: string; value: TabView }[] = [
    { label: 'Overview', value: 'overview' },
    { label: '프로젝트', value: 'projects' },
    { label: '모니터링', value: 'monitoring' },
    { label: 'OpenClaw', value: 'openclaw' },
    { label: '활동 피드', value: 'feed' },
    { label: '생산성', value: 'stats' },
    { label: '연동', value: 'connections' },
    { label: '작업 보드', value: 'board' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* NotificationBanner */}
      <NotificationBanner notifications={notifications} onDismiss={dismiss} />

      {/* CommandPalette */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab as TabView);
          setPaletteOpen(false);
        }}
        onAction={(action) => {
          handlePaletteAction(action);
          setPaletteOpen(false);
        }}
      />

      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Mission Control
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            워크스페이스 프로젝트 관제 대시보드
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {scannedAt && `${new Date(scannedAt).toLocaleTimeString('ko-KR')} 스캔`}
            {scannedAt && ' · '}
            {countdown}s
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            스캔
          </button>
        </div>
      </div>

      {/* 통계 */}
      {!loading && <StatsBar key={refreshKey} snapshots={snapshots} />}

      {/* 탭 내비게이션 */}
      <div className="mt-8 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 카테고리 필터 (프로젝트 탭에서만) */}
        {activeTab === 'projects' && (
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 탭 컨텐츠 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-500">프로젝트 스캔 중...</span>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <Overview
              key={refreshKey}
              snapshots={snapshots}
              onNavigate={(tab) => setActiveTab(tab as TabView)}
            />
          )}

          {activeTab === 'projects' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((snapshot) => (
                <ProjectCard
                  key={snapshot.project.folder}
                  snapshot={snapshot}
                />
              ))}
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div key={refreshKey} className="grid gap-4 lg:grid-cols-2">
              <MakeMoneyWidget />
              <EventWidget />
            </div>
          )}

          {activeTab === 'openclaw' && <OpenClawControl />}

          {activeTab === 'feed' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                전체 활동 타임라인
              </h2>
              <ActivityFeed />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                생산성 통계
              </h2>
              <ProductivityStats snapshots={snapshots} />
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                프로젝트 간 연동 현황
              </h2>
              <ConnectionMap />
            </div>
          )}

          {activeTab === 'board' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                작업 보드
              </h2>
              <TaskBoard />
            </div>
          )}
        </>
      )}
    </div>
  );
}
