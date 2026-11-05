CREATE TABLE IF NOT EXISTS calendar_sources (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('GOOGLE_ICAL')),
    source_url_encrypted TEXT NOT NULL,
    color TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    last_synced_at TEXT NULL,
    last_sync_status TEXT NOT NULL DEFAULT 'NEVER' CHECK (last_sync_status IN ('NEVER', 'SUCCESS', 'ERROR')),
    last_sync_message TEXT NULL,
    sync_window_start TEXT NULL,
    sync_window_end TEXT NULL,
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS external_calendar_events (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    source_uuid TEXT NOT NULL REFERENCES calendar_sources(uuid) ON DELETE CASCADE,
    external_uid TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NULL,
    location TEXT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    all_day INTEGER NOT NULL DEFAULT 0 CHECK (all_day IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (source_uuid, external_uid, starts_at)
);

CREATE INDEX IF NOT EXISTS idx_calendar_sources_active
    ON calendar_sources (is_active, deleted_at);

CREATE INDEX IF NOT EXISTS idx_external_calendar_events_range
    ON external_calendar_events (starts_at, ends_at, source_uuid);
