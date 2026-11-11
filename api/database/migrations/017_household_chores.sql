CREATE TABLE IF NOT EXISTS household_chores (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NULL,
    category TEXT NOT NULL CHECK (category IN ('CLEANING', 'TRASH', 'PLANTS', 'LAUNDRY', 'PETS', 'OTHER')),
    assigned_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    recurrence TEXT NOT NULL CHECK (recurrence IN ('ONCE', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY')),
    next_due_date TEXT NULL,
    last_completed_at TEXT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_household_chores_due
    ON household_chores (is_active, next_due_date, assigned_member_uuid, deleted_at);

CREATE TABLE IF NOT EXISTS household_chore_completions (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    chore_uuid TEXT NOT NULL REFERENCES household_chores(uuid),
    scheduled_date TEXT NOT NULL,
    completed_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    completed_at TEXT NOT NULL,
    UNIQUE (chore_uuid, scheduled_date)
);

CREATE INDEX IF NOT EXISTS idx_household_chore_completions_recent
    ON household_chore_completions (completed_at DESC, chore_uuid);
