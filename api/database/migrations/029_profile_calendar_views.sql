CREATE TABLE profile_preferences_next (
    member_uuid TEXT PRIMARY KEY REFERENCES family_members(uuid) ON DELETE CASCADE,
    dashboard_cards_json TEXT NOT NULL DEFAULT '[]',
    wall_cards_json TEXT NOT NULL DEFAULT '[]',
    quiet_hours_enabled INTEGER NOT NULL DEFAULT 0 CHECK (quiet_hours_enabled IN (0, 1)),
    quiet_hours_start TEXT NOT NULL DEFAULT '22:00',
    quiet_hours_end TEXT NOT NULL DEFAULT '07:00',
    calendar_view TEXT NOT NULL DEFAULT 'WEEK' CHECK (calendar_view IN ('DAY', 'TIMELINE', 'FIVE_DAY', 'WEEK', 'MONTH')),
    calendar_member_ids_json TEXT NOT NULL DEFAULT '[]',
    calendar_ids_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

INSERT INTO profile_preferences_next (
    member_uuid, dashboard_cards_json, wall_cards_json, quiet_hours_enabled,
    quiet_hours_start, quiet_hours_end, calendar_view, calendar_member_ids_json,
    calendar_ids_json, created_at, updated_at
)
SELECT
    member_uuid, dashboard_cards_json, wall_cards_json, quiet_hours_enabled,
    quiet_hours_start, quiet_hours_end, calendar_view, calendar_member_ids_json,
    calendar_ids_json, created_at, updated_at
FROM profile_preferences;

DROP TABLE profile_preferences;
ALTER TABLE profile_preferences_next RENAME TO profile_preferences;
