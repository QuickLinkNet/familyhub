ALTER TABLE family_members ADD COLUMN birth_date TEXT NULL;

ALTER TABLE calendar_events ADD COLUMN recurrence_frequency TEXT NULL
    CHECK (recurrence_frequency IS NULL OR recurrence_frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'));
ALTER TABLE calendar_events ADD COLUMN recurrence_interval INTEGER NOT NULL DEFAULT 1
    CHECK (recurrence_interval BETWEEN 1 AND 12);
ALTER TABLE calendar_events ADD COLUMN recurrence_until TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_calendar_events_recurrence
    ON calendar_events (recurrence_frequency, recurrence_until, deleted_at);
