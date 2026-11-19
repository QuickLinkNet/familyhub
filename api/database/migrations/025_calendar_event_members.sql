CREATE TABLE IF NOT EXISTS calendar_event_members (
    event_uuid TEXT NOT NULL REFERENCES calendar_events(uuid) ON DELETE CASCADE,
    member_uuid TEXT NOT NULL REFERENCES family_members(uuid) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (event_uuid, member_uuid)
);

CREATE INDEX IF NOT EXISTS idx_calendar_event_members_member
    ON calendar_event_members (member_uuid, event_uuid);

INSERT OR IGNORE INTO calendar_event_members (event_uuid, member_uuid, position)
SELECT e.uuid, COALESCE(c.owner_member_uuid, e.created_by_member_uuid), 0
FROM calendar_events e
JOIN calendars c ON c.uuid = e.calendar_uuid
WHERE e.deleted_at IS NULL AND COALESCE(c.owner_member_uuid, e.created_by_member_uuid) IS NOT NULL;
