CREATE TABLE IF NOT EXISTS calendar_events (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    calendar_uuid TEXT NOT NULL REFERENCES calendars(uuid),
    title TEXT NOT NULL,
    description TEXT NULL,
    location TEXT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    all_day INTEGER NOT NULL DEFAULT 0 CHECK (all_day IN (0, 1)),
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_range
    ON calendar_events (starts_at, ends_at, deleted_at);

CREATE INDEX IF NOT EXISTS idx_calendar_events_calendar
    ON calendar_events (calendar_uuid, starts_at, deleted_at);
