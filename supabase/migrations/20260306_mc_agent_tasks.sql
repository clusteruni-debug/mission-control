-- mc_agent_tasks: Agent Queue task tracking
CREATE TABLE IF NOT EXISTS mc_agent_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority INT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  phase TEXT NOT NULL DEFAULT 'pending' CHECK (phase IN ('proposed', 'pending', 'plan', 'build', 'review', 'done', 'failed', 'escalated')),
  parent_id UUID REFERENCES mc_agent_tasks(id),
  role TEXT,
  agent TEXT,
  attempt INT DEFAULT 0,
  review_result TEXT,
  review_feedback TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  result_summary TEXT,
  commit_sha TEXT,
  error TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'patrol-bug', 'patrol-roadmap', 'patrol-quality'))
);

ALTER TABLE mc_agent_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON mc_agent_tasks FOR ALL USING (true) WITH CHECK (true);
