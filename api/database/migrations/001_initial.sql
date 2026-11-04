CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO app_settings (setting_key, setting_value, created_at, updated_at)
VALUES ('application_version', '0.1.0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
