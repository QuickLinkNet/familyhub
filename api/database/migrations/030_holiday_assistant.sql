PRAGMA defer_foreign_keys = ON;

CREATE TABLE calendar_sources_next (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('GOOGLE_ICAL', 'OPEN_HOLIDAYS')),
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

INSERT INTO calendar_sources_next SELECT * FROM calendar_sources;

CREATE TABLE external_calendar_events_next (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    source_uuid TEXT NOT NULL REFERENCES calendar_sources_next(uuid) ON DELETE CASCADE,
    external_uid TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NULL,
    location TEXT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    all_day INTEGER NOT NULL DEFAULT 0 CHECK (all_day IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_private INTEGER NOT NULL DEFAULT 0 CHECK (is_private IN (0, 1)),
    UNIQUE (source_uuid, external_uid, starts_at)
);

INSERT INTO external_calendar_events_next SELECT * FROM external_calendar_events;
DROP TABLE external_calendar_events;
DROP TABLE calendar_sources;
ALTER TABLE calendar_sources_next RENAME TO calendar_sources;
ALTER TABLE external_calendar_events_next RENAME TO external_calendar_events;

CREATE INDEX idx_calendar_sources_active ON calendar_sources (is_active, deleted_at);
CREATE INDEX idx_external_calendar_events_range ON external_calendar_events (starts_at, ends_at, source_uuid);

CREATE TABLE holiday_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    country_code TEXT NOT NULL DEFAULT 'DE' CHECK (country_code = 'DE'),
    subdivision_code TEXT NOT NULL,
    public_enabled INTEGER NOT NULL DEFAULT 1 CHECK (public_enabled IN (0, 1)),
    school_enabled INTEGER NOT NULL DEFAULT 1 CHECK (school_enabled IN (0, 1)),
    public_source_uuid TEXT NULL REFERENCES calendar_sources(uuid),
    school_source_uuid TEXT NULL REFERENCES calendar_sources(uuid),
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

