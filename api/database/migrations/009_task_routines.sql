ALTER TABLE tasks ADD COLUMN routine_period TEXT NULL CHECK (routine_period IN ('MORNING', 'AFTERNOON', 'EVENING'));
ALTER TABLE tasks ADD COLUMN repeat_days TEXT NULL;
ALTER TABLE tasks ADD COLUMN series_uuid TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_routine_due_date ON tasks (routine_period, due_date, status);
CREATE INDEX IF NOT EXISTS idx_tasks_series ON tasks (series_uuid);
