create table if not exists mc_trades (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  market text not null,
  side text not null,
  pnl numeric not null,
  trade_ts timestamptz not null,
  raw_data jsonb not null default '{}'::jsonb
);

create unique index if not exists uq_mc_trades_market_side_trade_ts
  on mc_trades (market, side, trade_ts);

create index if not exists idx_mc_trades_trade_ts
  on mc_trades (trade_ts desc);
