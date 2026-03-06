-- Rename legacy 'openclaw' column to 'watchbot' in mc_snapshots
-- The column stores WatchBot health data, not OpenClaw Gateway data
alter table mc_snapshots rename column openclaw to watchbot;
