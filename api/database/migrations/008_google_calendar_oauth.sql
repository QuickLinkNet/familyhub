CREATE TABLE IF NOT EXISTS google_oauth_connections (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    client_id_encrypted TEXT NOT NULL,
    client_secret_encrypted TEXT NOT NULL,
    access_token_encrypted TEXT NULL,
    refresh_token_encrypted TEXT NULL,
    token_expires_at TEXT NULL,
    granted_scopes TEXT NULL,
    account_label TEXT NULL,
    oauth_state_hash TEXT NULL,
    oauth_state_expires_at TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS google_calendar_sources (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    external_id_hash TEXT NOT NULL UNIQUE,
    external_id_encrypted TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    access_role TEXT NOT NULL,
    is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
    is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)),
    last_synced_at TEXT NULL,
    last_sync_status TEXT NOT NULL DEFAULT 'NEVER' CHECK (last_sync_status IN ('NEVER', 'SUCCESS', 'ERROR')),
    last_sync_message TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS google_calendar_events (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    source_uuid TEXT NOT NULL REFERENCES google_calendar_sources(uuid) ON DELETE CASCADE,
    external_event_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NULL,
    location TEXT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    all_day INTEGER NOT NULL DEFAULT 0 CHECK (all_day IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (source_uuid, external_event_id)
);

CREATE INDEX IF NOT EXISTS idx_google_calendar_sources_active
    ON google_calendar_sources (is_active, deleted_at);

CREATE INDEX IF NOT EXISTS idx_google_calendar_events_range
    ON google_calendar_events (starts_at, ends_at, source_uuid);
