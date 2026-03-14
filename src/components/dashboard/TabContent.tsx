'use client';

import { Loader2 } from 'lucide-react';
import { ProjectCard } from '../ProjectCard';
import { ActivityFeed } from '../ActivityFeed';
import { ProductivityStats } from '../ProductivityStats';
import { ConnectionMap } from '../ConnectionMap';
import { InfrastructureMap } from '../InfrastructureMap';
import { MakeMoneyWidget } from '../MakeMoneyWidget';
import { EventWidget } from '../EventWidget';
import { Overview } from '../Overview';
import { DocHealth } from '../DocHealth';
import { SessionDiary } from '../SessionDiary';
import { ServiceControlPanel } from '../ServiceControlPanel';
import { DependencyImpact } from '../DependencyImpact';
import { OperationsPanel } from '../OperationsPanel';
import { TimelineSection } from '../overview/TimelineSection';
import { RoadmapSection } from '../overview/RoadmapSection';
import type { ProjectSnapshot } from '@/types';
import type { TabView } from './types';

interface TabContentProps {
  activeTab: TabView;
  loading: boolean;
  snapshots: ProjectSnapshot[];
  sorted: ProjectSnapshot[];
  onNavigate: (tab: string) => void;
}

export function TabContent({
  activeTab,
  loading,
  snapshots,
  sorted,
  onNavigate,
}: TabContentProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500">프로젝트 스캔 중...</span>
      </div>
    );
  }

  return (
    <>
      {activeTab === 'overview' && (
        <Overview
          snapshots={snapshots}
          onNavigate={onNavigate}
        />
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6">
          <RoadmapSection snapshots={snapshots} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((snapshot) => (
              <ProjectCard
                key={snapshot.project.folder}
                snapshot={snapshot}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          {/* Dependency Impact (only renders when services are down) */}
          <DependencyImpact />

          <div className="grid gap-4 lg:grid-cols-2">
            <MakeMoneyWidget />
            <EventWidget />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              프로젝트 간 연동 현황
            </h2>
            <ConnectionMap />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              인프라 인스턴스 맵
            </h2>
            <InfrastructureMap />
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            서비스 제어
          </h2>
          <ServiceControlPanel />
        </div>
      )}

      {activeTab === 'operations' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            운영
          </h2>
          <OperationsPanel />
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              생산성 통계
            </h2>
            <ProductivityStats snapshots={snapshots} />
          </div>
          <TimelineSection />
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              세션 다이어리
            </h2>
            <SessionDiary />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              활동 타임라인
            </h2>
            <ActivityFeed />
          </div>
        </div>
      )}

      {activeTab === 'doc-health' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            문서 상태
          </h2>
          <DocHealth />
        </div>
      )}
    </>
  );
}
