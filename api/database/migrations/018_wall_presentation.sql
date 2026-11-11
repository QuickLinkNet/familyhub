CREATE TABLE IF NOT EXISTS wall_presentation_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    greeting TEXT NOT NULL DEFAULT 'Schön, dass ihr da seid',
    weather_enabled INTEGER NOT NULL DEFAULT 0 CHECK (weather_enabled IN (0, 1)),
    weather_location TEXT,
    weather_latitude REAL,
    weather_longitude REAL,
    updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO wall_presentation_settings (
    id, greeting, weather_enabled, updated_at
) VALUES (
    1, 'Schön, dass ihr da seid', 0, CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wall_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    stored_name TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    created_by_member_uuid TEXT NOT NULL,
    created_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (created_by_member_uuid) REFERENCES family_members(uuid)
);

CREATE INDEX IF NOT EXISTS idx_wall_photos_active
    ON wall_photos (deleted_at, created_at);
