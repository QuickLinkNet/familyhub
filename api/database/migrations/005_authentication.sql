CREATE TABLE IF NOT EXISTS auth_login_attempts (
    identifier TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_login_attempts_updated_at
    ON auth_login_attempts (updated_at);
