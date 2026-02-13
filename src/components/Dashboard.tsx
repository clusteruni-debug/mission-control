'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProjectCard } from './ProjectCard';
import { StatsBar } from './StatsBar';
import { ActivityFeed } from './ActivityFeed';
import { ProductivityStats } from './ProductivityStats';
import { ConnectionMap } from './ConnectionMap';
import type { ProjectSnapshot, ScanResult } from '@/types';
import { RefreshCw, Loader2 } from 'lucide-react';

type FilterCategory = 'all' | 'running' | 'dev' | 'legacy' | 'tool';
type TabView = 'projects' | 'feed' | 'stats' | 'connections';

export function Dashboard() {
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [scannedAt, setScannedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [activeTab, setActiveTab] = useState<TabView>('projects');

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    { label: '프로젝트', value: 'projects' },
    { label: '활동 피드', value: 'feed' },
    { label: '생산성', value: 'stats' },
    { label: '연동', value: 'connections' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          {scannedAt && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(scannedAt).toLocaleTimeString('ko-KR')} 스캔
            </span>
          )}
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
      {!loading && <StatsBar snapshots={snapshots} />}

      {/* 탭 내비게이션 */}
      <div className="mt-8 mb-6 flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
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
        </>
      )}
    </div>
  );
}
