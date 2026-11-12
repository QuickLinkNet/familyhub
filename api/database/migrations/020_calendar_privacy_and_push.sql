ALTER TABLE calendar_events ADD COLUMN is_private INTEGER NOT NULL DEFAULT 0
    CHECK (is_private IN (0, 1));

ALTER TABLE external_calendar_events ADD COLUMN is_private INTEGER NOT NULL DEFAULT 0
    CHECK (is_private IN (0, 1));

ALTER TABLE google_calendar_events ADD COLUMN is_private INTEGER NOT NULL DEFAULT 0
    CHECK (is_private IN (0, 1));

CREATE TABLE IF NOT EXISTS push_vapid_keys (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    public_key TEXT NOT NULL,
    private_key_encrypted TEXT NOT NULL,
    subject TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    member_uuid TEXT NOT NULL REFERENCES family_members(uuid) ON DELETE CASCADE,
    endpoint_hash TEXT NOT NULL UNIQUE,
    endpoint_encrypted TEXT NOT NULL,
    p256dh_encrypted TEXT NOT NULL,
    auth_encrypted TEXT NOT NULL,
    device_label TEXT NOT NULL,
    user_agent TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_success_at TEXT NULL,
    last_error_at TEXT NULL,
    last_error TEXT NULL,
    failure_count INTEGER NOT NULL DEFAULT 0,
    revoked_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_member
    ON push_subscriptions (member_uuid, revoked_at);

CREATE TABLE IF NOT EXISTS push_deliveries (
    subscription_uuid TEXT NOT NULL REFERENCES push_subscriptions(uuid) ON DELETE CASCADE,
    reminder_fingerprint TEXT NOT NULL,
    sent_at TEXT NOT NULL,
    PRIMARY KEY (subscription_uuid, reminder_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_push_deliveries_sent
    ON push_deliveries (sent_at);
