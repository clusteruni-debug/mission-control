-- Add operations columns to mc_incidents for auto-recovery tracking
ALTER TABLE mc_incidents
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS action_taken TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recovery_duration_ms INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
