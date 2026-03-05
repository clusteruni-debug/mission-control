-- mc_tasks: type 컬럼 추가 (작업 유형 분류)
ALTER TABLE mc_tasks ADD COLUMN IF NOT EXISTS type text DEFAULT 'task'
  CHECK (type IN ('task','backlog','bug','feature','integration-idea','maintenance'));

CREATE INDEX IF NOT EXISTS idx_mc_tasks_type ON mc_tasks(type);
