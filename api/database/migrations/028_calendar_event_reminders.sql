ALTER TABLE calendar_events ADD COLUMN reminder_offsets_json TEXT NOT NULL DEFAULT '[120]';
ALTER TABLE calendar_events ADD COLUMN board_sound INTEGER NOT NULL DEFAULT 0;
