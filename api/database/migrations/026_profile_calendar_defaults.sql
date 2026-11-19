ALTER TABLE profile_preferences ADD COLUMN calendar_view TEXT NOT NULL DEFAULT 'WEEK' CHECK (calendar_view IN ('DAY', 'WEEK', 'MONTH'));
ALTER TABLE profile_preferences ADD COLUMN calendar_member_ids_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE profile_preferences ADD COLUMN calendar_ids_json TEXT NOT NULL DEFAULT '[]';
