ALTER TABLE tasks ADD COLUMN reward_points INTEGER NOT NULL DEFAULT 0 CHECK (reward_points BETWEEN 0 AND 100);

CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NULL,
    cost_points INTEGER NOT NULL CHECK (cost_points BETWEEN 1 AND 10000),
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS reward_ledger (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    task_uuid TEXT NULL REFERENCES tasks(uuid),
    reward_uuid TEXT NULL REFERENCES rewards(uuid),
    entry_type TEXT NOT NULL CHECK (entry_type IN ('EARNED', 'REDEEMED', 'BONUS')),
    points_delta INTEGER NOT NULL CHECK (points_delta <> 0),
    reason TEXT NOT NULL,
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    UNIQUE (task_uuid)
);

CREATE INDEX IF NOT EXISTS idx_reward_ledger_member_created ON reward_ledger (member_uuid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rewards_active_cost ON rewards (is_active, cost_points);
