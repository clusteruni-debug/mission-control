create table if not exists mc_snapshots (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  project_stats jsonb not null default '{}'::jsonb,
  make_money jsonb not null default '{}'::jsonb,
  watchbot jsonb not null default '{}'::jsonb,
  events jsonb not null default '{}'::jsonb
);

create index if not exists idx_mc_snapshots_created_at
  on mc_snapshots (created_at desc);
