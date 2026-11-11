CREATE TABLE IF NOT EXISTS family_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL DEFAULT '🎯',
    color TEXT NOT NULL DEFAULT '#D6855F',
    target_value INTEGER NOT NULL CHECK (target_value BETWEEN 2 AND 100),
    due_date TEXT,
    created_by_member_uuid TEXT NOT NULL,
    completed_at TEXT,
    deleted_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (created_by_member_uuid) REFERENCES family_members(uuid)
);

CREATE TABLE IF NOT EXISTS family_goal_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    goal_uuid TEXT NOT NULL,
    member_uuid TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount BETWEEN 1 AND 10),
    note TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (goal_uuid) REFERENCES family_goals(uuid),
    FOREIGN KEY (member_uuid) REFERENCES family_members(uuid)
);

CREATE INDEX IF NOT EXISTS idx_family_goals_active
    ON family_goals (deleted_at, completed_at, due_date);

CREATE INDEX IF NOT EXISTS idx_family_goal_contributions_goal
    ON family_goal_contributions (goal_uuid, created_at);
