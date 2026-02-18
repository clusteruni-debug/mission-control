'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

type RangeKey = '24h' | '7d' | '30d';

interface TrendPoint {
  timestamp: string;
  value: number;
}

export interface TrendChartProps {
  data: TrendPoint[];
  label: string;
  color?: string;
  height?: number;
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
  valuePrefix?: string;
  valueSuffix?: string;
  loading?: boolean;
}

function toHexColor(color?: string): string {
  if (!color) return '#10b981';
  if (color === 'blue') return '#3b82f6';
  if (color === 'amber') return '#f59e0b';
  if (color === 'red') return '#ef4444';
  if (color === 'purple') return '#8b5cf6';
  return '#10b981';
}

function formatValue(value: number, prefix = '', suffix = ''): string {
  return `${prefix}${Number(value).toLocaleString()}${suffix}`;
}

function formatXAxisTick(ts: string, range: RangeKey): string {
  const date = new Date(ts);
  if (range === '24h') {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}

export function TrendChart({
  data,
  label,
  color,
  height = 200,
  range,
  onRangeChange,
  valuePrefix = '',
  valueSuffix = '',
  loading = false,
}: TrendChartProps) {
  const chartColor = useMemo(() => toHexColor(color), [color]);
  const safeData = data || [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {label}
        </h3>
        <div className="flex items-center gap-1 rounded-md bg-gray-100 p-1 dark:bg-gray-800">
          {(['24h', '7d', '30d'] as const).map((key) => (
            <button
              key={key}
              onClick={() => onRangeChange(key)}
              className={`rounded px-2 py-1 text-xs font-medium ${
                range === key
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-36 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          데이터 로딩 중...
        </div>
      ) : safeData.length === 0 ? (
        <div className="flex h-36 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          데이터 수집 중...
        </div>
      ) : (
        <div style={{ width: '100%', height: Math.max(160, height) }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.25} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => formatXAxisTick(value, range)}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} width={56} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: 8,
                  color: '#f9fafb',
                }}
                labelFormatter={(value) =>
                  new Date(value).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }
                formatter={(value: number | string | Array<number | string> | undefined) => {
                  const scalar = Array.isArray(value) ? value[0] : value;
                  const num = typeof scalar === 'number' ? scalar : Number(scalar || 0);
                  return formatValue(num, valuePrefix, valueSuffix);
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
