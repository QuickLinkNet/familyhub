CREATE TABLE IF NOT EXISTS meal_recipes (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NULL,
    icon TEXT NOT NULL DEFAULT '🍽️',
    color TEXT NOT NULL,
    prep_minutes INTEGER NULL CHECK (prep_minutes IS NULL OR prep_minutes BETWEEN 1 AND 1440),
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS meal_recipe_ingredients (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    recipe_uuid TEXT NOT NULL REFERENCES meal_recipes(uuid),
    name TEXT NOT NULL,
    quantity TEXT NULL,
    category TEXT NOT NULL DEFAULT 'OTHER' CHECK (category IN ('PRODUCE', 'BAKERY', 'DAIRY', 'MEAT', 'PANTRY', 'FROZEN', 'DRINKS', 'HOUSEHOLD', 'HYGIENE', 'OTHER')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS meal_plan_entries (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    planned_date TEXT NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER')),
    recipe_uuid TEXT NULL REFERENCES meal_recipes(uuid),
    title TEXT NOT NULL,
    note TEXT NULL,
    created_by_member_uuid TEXT NOT NULL REFERENCES family_members(uuid),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_plan_unique_slot ON meal_plan_entries (planned_date, meal_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_meal_plan_date ON meal_plan_entries (planned_date, meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_ingredients_recipe ON meal_recipe_ingredients (recipe_uuid, sort_order);
