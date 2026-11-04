CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'PARENT', 'CHILD')),
    pin_hash TEXT NULL,
    avatar_url TEXT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_family_members_active ON family_members (is_active, name);
