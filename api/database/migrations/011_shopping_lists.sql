CREATE TABLE IF NOT EXISTS shopping_lists (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🛒',
    color TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS shopping_items (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    list_uuid TEXT NOT NULL REFERENCES shopping_lists(uuid),
    name TEXT NOT NULL,
    quantity TEXT NULL,
    category TEXT NOT NULL DEFAULT 'OTHER' CHECK (category IN ('PRODUCE', 'BAKERY', 'DAIRY', 'MEAT', 'PANTRY', 'FROZEN', 'DRINKS', 'HOUSEHOLD', 'HYGIENE', 'OTHER')),
    note TEXT NULL,
    is_urgent INTEGER NOT NULL DEFAULT 0 CHECK (is_urgent IN (0, 1)),
    is_checked INTEGER NOT NULL DEFAULT 0 CHECK (is_checked IN (0, 1)),
    added_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    checked_by_member_uuid TEXT NULL REFERENCES family_members(uuid),
    checked_at TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_sort ON shopping_lists (sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_shopping_items_list_state ON shopping_items (list_uuid, is_checked, is_urgent, category, created_at);
