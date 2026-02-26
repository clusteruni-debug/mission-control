-- mc_tasks: 사용자 작업 보드 (CRUD)
CREATE TABLE IF NOT EXISTS mc_tasks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  project text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mc_tasks_status ON mc_tasks(status);
CREATE INDEX IF NOT EXISTS idx_mc_tasks_created_at ON mc_tasks(created_at DESC);
