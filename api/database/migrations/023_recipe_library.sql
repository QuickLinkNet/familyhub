ALTER TABLE meal_recipes
    ADD COLUMN servings INTEGER NOT NULL DEFAULT 4 CHECK (servings BETWEEN 1 AND 50);

ALTER TABLE meal_recipes
    ADD COLUMN category TEXT NOT NULL DEFAULT 'OTHER'
        CHECK (category IN ('BREAKFAST', 'MAIN', 'SOUP', 'SALAD', 'BAKING', 'SNACK', 'DESSERT', 'DRINK', 'OTHER'));

ALTER TABLE meal_recipes
    ADD COLUMN instructions_json TEXT NOT NULL DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_meal_recipes_category
    ON meal_recipes (deleted_at, category, title COLLATE NOCASE);
