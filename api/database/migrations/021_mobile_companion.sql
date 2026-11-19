CREATE TABLE IF NOT EXISTS auth_invitations (
    uuid TEXT PRIMARY KEY,
    member_uuid TEXT NOT NULL REFERENCES family_members(uuid) ON DELETE CASCADE,
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    redeemed_at TEXT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_invitations_member
    ON auth_invitations (member_uuid, expires_at);

CREATE TABLE IF NOT EXISTS auth_devices (
    uuid TEXT PRIMARY KEY,
    member_uuid TEXT NOT NULL REFERENCES family_members(uuid) ON DELETE CASCADE,
    session_hash TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    revoked_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_devices_member
    ON auth_devices (member_uuid, revoked_at, last_seen_at);
