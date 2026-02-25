export interface RawHealth {
  status: string;
  uptime: number;
  agent: string;
}

export interface RawPortfolio {
  balance: number;
  totalPnL: number;
  openPositions: number;
  winRate: number;
}

export interface RawEngine {
  id: string;
  name: string;
  enabled: boolean;
  lastRun: number | null;
}

export interface RawTrade {
  id: string;
  symbol: string;
  status: string;
  filled_cost: number;
  exit_proceeds: number | null;
  entry_timestamp: number;
  close_reason: string | null;
}
