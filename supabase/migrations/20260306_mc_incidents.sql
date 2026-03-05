-- mc_incidents: Mission Control incident tracking
CREATE TABLE IF NOT EXISTS mc_incidents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved')),
  services_affected TEXT[] DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (service role bypasses automatically)
ALTER TABLE mc_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON mc_incidents FOR ALL USING (true) WITH CHECK (true);
