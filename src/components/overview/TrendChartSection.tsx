'use client';

import dynamic from 'next/dynamic';
import { BarChart3 } from 'lucide-react';
import type { TrendPoint, RangeKey } from './types';

const TrendChart = dynamic(() => import('../TrendChart').then(m => ({ default: m.TrendChart })), {
  ssr: false,
  loading: () => <div className="h-52 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});

interface TrendChartSectionProps {
  balanceData: TrendPoint[];
  participationData: TrendPoint[];
  projectCountData: TrendPoint[];
  chartRange: RangeKey;
  onRangeChange: (range: RangeKey) => void;
  chartLoading: boolean;
}

export function TrendChartSection({
  balanceData,
  participationData,
  projectCountData,
  chartRange,
  onRangeChange,
  chartLoading,
}: TrendChartSectionProps) {
  const hasAnyChartData =
    balanceData.length > 0 || participationData.length > 0 || projectCountData.length > 0;

  return (
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
            onRangeChange={onRangeChange}
            valuePrefix="$"
            loading={chartLoading}
          />
          <TrendChart
            data={participationData}
            label="이벤트 참여율"
            color="amber"
            range={chartRange}
            onRangeChange={onRangeChange}
            valueSuffix="%"
            loading={chartLoading}
          />
          <TrendChart
            data={projectCountData}
            label="프로젝트 수"
            color="purple"
            range={chartRange}
            onRangeChange={onRangeChange}
            loading={chartLoading}
          />
        </div>
      )}
    </div>
  );
}
