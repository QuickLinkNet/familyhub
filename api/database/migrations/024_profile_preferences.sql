CREATE TABLE IF NOT EXISTS profile_preferences (
    member_uuid TEXT PRIMARY KEY REFERENCES family_members(uuid) ON DELETE CASCADE,
    dashboard_cards_json TEXT NOT NULL DEFAULT '[]',
    wall_cards_json TEXT NOT NULL DEFAULT '[]',
    quiet_hours_enabled INTEGER NOT NULL DEFAULT 0 CHECK (quiet_hours_enabled IN (0, 1)),
    quiet_hours_start TEXT NOT NULL DEFAULT '22:00',
    quiet_hours_end TEXT NOT NULL DEFAULT '07:00',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
