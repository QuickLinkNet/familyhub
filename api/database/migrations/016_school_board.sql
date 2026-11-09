CREATE TABLE IF NOT EXISTS school_lessons (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    subject TEXT NOT NULL,
    weekday INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 7),
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    room TEXT NULL,
    teacher TEXT NULL,
    color TEXT NOT NULL,
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_school_lessons_schedule
    ON school_lessons (member_uuid, weekday, starts_at, deleted_at);

CREATE TABLE IF NOT EXISTS school_items (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    item_type TEXT NOT NULL CHECK (item_type IN ('HOMEWORK', 'TEST')),
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NULL,
    due_date TEXT NOT NULL,
    completed_at TEXT NULL,
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_school_items_agenda
    ON school_items (member_uuid, due_date, completed_at, deleted_at);
