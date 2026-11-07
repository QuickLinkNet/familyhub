CREATE TABLE IF NOT EXISTS routine_templates (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NULL,
    assigned_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    routine_period TEXT NOT NULL CHECK (routine_period IN ('MORNING', 'AFTERNOON', 'EVENING')),
    repeat_days TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS routine_steps (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    template_uuid TEXT NOT NULL REFERENCES routine_templates(uuid),
    title TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS routine_runs (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    template_uuid TEXT NOT NULL REFERENCES routine_templates(uuid),
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'COMPLETED')),
    completed_at TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (template_uuid, due_date)
);

CREATE TABLE IF NOT EXISTS routine_run_steps (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    run_uuid TEXT NOT NULL REFERENCES routine_runs(uuid),
    template_step_uuid TEXT NULL REFERENCES routine_steps(uuid),
    title TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 0),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'COMPLETED')),
    completed_by_member_uuid TEXT NULL REFERENCES family_members(uuid),
    completed_at TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (run_uuid, position)
);

CREATE INDEX IF NOT EXISTS idx_routine_templates_active ON routine_templates (is_active, routine_period, deleted_at);
CREATE INDEX IF NOT EXISTS idx_routine_steps_template ON routine_steps (template_uuid, position, deleted_at);
CREATE INDEX IF NOT EXISTS idx_routine_runs_date ON routine_runs (due_date, status, template_uuid);
CREATE INDEX IF NOT EXISTS idx_routine_run_steps_run ON routine_run_steps (run_uuid, position, status);
