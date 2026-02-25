import type { ProjectSnapshot } from '@/types';
import type { ServiceStatus } from '@/types/status';

export interface OverviewProps {
  snapshots: ProjectSnapshot[];
  onNavigate: (tab: string) => void;
}

export interface MakeMoneyOverview {
  balance: number;
  totalPnL: number;
  agent: string;
}

export interface WatchBotOverview {
  status: string;
  success_rate: number;
}

export interface EventOverview {
  deadlineSoon: number;
  participationRate: number;
  unanalyzed: number;
}

export interface TimelineItem {
  type: 'commit' | 'watchbot' | 'trade' | 'event';
  title: string;
  detail: string;
  timestamp: string;
}

export type RangeKey = '24h' | '7d' | '30d';

export interface TrendPoint {
  timestamp: string;
  value: number;
}

export interface SnapshotRow {
  created_at: string;
  make_money: Record<string, unknown>;
  events: Record<string, unknown>;
  project_stats: Record<string, unknown>;
}

export interface SummaryCardDef {
  title: string;
  tab: string;
  icon: React.ComponentType<{ className?: string }>;
  status: ServiceStatus;
  rows: { label: string; value: string; color?: string }[];
}
