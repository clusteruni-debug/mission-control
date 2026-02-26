'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StatsBar } from './StatsBar';
import { CommandPalette } from './CommandPalette';
import { NotificationBanner } from './NotificationBanner';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotifications } from '@/hooks/useNotifications';
import type { ProjectSnapshot, ScanResult } from '@/types';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { TabNavigation } from './dashboard/TabNavigation';
import { TabContent } from './dashboard/TabContent';
import { AUTO_REFRESH_MS } from './dashboard/types';
import type { FilterCategory, TabView } from './dashboard/types';

export function Dashboard() {
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [scannedAt, setScannedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_MS / 1000);
  const countdownRef = useRef(AUTO_REFRESH_MS / 1000);
  const hasLoadedRef = useRef(false);

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

  // --- Data fetching ---

  const fetchData = useCallback(async () => {
    if (!hasLoadedRef.current) setLoading(true);
    try {
      const res = await fetch('/api/scan');
      if (!res.ok) {
        console.error('스캔 API 오류:', res.status);
        return;
      }
      const data: ScanResult = await res.json();
      setSnapshots(Array.isArray(data?.snapshots) ? data.snapshots : []);
      setScannedAt(data?.scannedAt ?? null);
      hasLoadedRef.current = true;
    } catch (err) {
      console.error('스캔 데이터 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Keyboard Shortcuts ---

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
        case 'quick_watchbot_status':
          setActiveTab('monitoring');
          break;
        case 'quick_event_participation':
          setActiveTab('monitoring');
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
    const catOrder: Record<string, number> = { running: 0, dev: 1, tool: 2, legacy: 3 };
    const catDiff =
      (catOrder[a.project.category] ?? 99) - (catOrder[b.project.category] ?? 99);
    if (catDiff !== 0) return catDiff;
    const aDays = a.git.daysSinceCommit ?? 999;
    const bDays = b.git.daysSinceCommit ?? 999;
    return bDays - aDays;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <NotificationBanner notifications={notifications} onDismiss={dismiss} />

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

      <DashboardHeader
        scannedAt={scannedAt}
        countdown={countdown}
        loading={loading}
        onRefresh={fetchData}
      />

      {!loading && <StatsBar snapshots={snapshots} />}

      <TabNavigation
        activeTab={activeTab}
        filter={filter}
        onTabChange={setActiveTab}
        onFilterChange={setFilter}
      />

      <TabContent
        activeTab={activeTab}
        loading={loading}
        snapshots={snapshots}
        sorted={sorted}
        onNavigate={(tab) => setActiveTab(tab as TabView)}
      />
    </div>
  );
}
