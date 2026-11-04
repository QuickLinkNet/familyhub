CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NULL,
    assigned_member_uuid TEXT NULL REFERENCES family_members(uuid),
    due_date TEXT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'PENDING_VERIFICATION', 'COMPLETED')),
    requires_verification INTEGER NOT NULL DEFAULT 0 CHECK (requires_verification IN (0, 1)),
    completed_at TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_status_due_date ON tasks (status, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_member ON tasks (assigned_member_uuid);
