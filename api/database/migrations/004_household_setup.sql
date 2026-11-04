ALTER TABLE family_members ADD COLUMN password_hash TEXT NULL;

CREATE TABLE IF NOT EXISTS households (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    uuid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'de-DE',
    timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
    setup_completed_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS calendars (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    household_uuid TEXT NOT NULL REFERENCES households(uuid),
    owner_member_uuid TEXT NULL REFERENCES family_members(uuid),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    calendar_type TEXT NOT NULL CHECK (calendar_type IN ('SHARED', 'PERSONAL')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_calendars_household ON calendars (household_uuid, is_active);
CREATE INDEX IF NOT EXISTS idx_calendars_owner ON calendars (owner_member_uuid);
