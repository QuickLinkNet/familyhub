CREATE TABLE IF NOT EXISTS family_notes (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    is_important INTEGER NOT NULL DEFAULT 0 CHECK (is_important IN (0, 1)),
    expires_on TEXT NULL,
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_family_notes_visible
    ON family_notes (deleted_at, is_important DESC, expires_on, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_notes_author
    ON family_notes (created_by_member_uuid, deleted_at);
