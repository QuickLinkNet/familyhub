CREATE TABLE IF NOT EXISTS family_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'FAMILY' CHECK (visibility IN ('FAMILY', 'ADULTS', 'PRIVATE')),
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS family_list_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    list_uuid TEXT NOT NULL REFERENCES family_lists(uuid),
    title TEXT NOT NULL,
    note TEXT NULL,
    assigned_to_member_uuid TEXT NULL REFERENCES family_members(uuid),
    is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    completed_by_member_uuid TEXT NULL REFERENCES family_members(uuid),
    completed_at TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_family_lists_visibility
    ON family_lists (deleted_at, visibility, created_by_member_uuid, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_list_items_state
    ON family_list_items (list_uuid, deleted_at, is_completed, created_at);
