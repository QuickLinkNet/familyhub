import { memberColors } from '../../../theme/memberPalette';
import type { MealType, RecipeCategory } from '../types/meal';

export const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];
export const mealMeta: Record<MealType, { label: string; shortLabel: string; icon: string }> = {
  BREAKFAST: { label: 'Frühstück', shortLabel: 'Früh', icon: '☕' },
  LUNCH: { label: 'Mittagessen', shortLabel: 'Mittag', icon: '🥗' },
  DINNER: { label: 'Abendessen', shortLabel: 'Abend', icon: '🍽️' },
};

export const recipeIcons = ['🍽️', '🍝', '🍕', '🥗', '🍲', '🌮', '🥞', '🍛', '🥪', '🥘', '🍣', '🧁'];
export const recipeColors = memberColors;
export const recipeCategories: RecipeCategory[] = ['BREAKFAST', 'MAIN', 'SOUP', 'SALAD', 'BAKING', 'SNACK', 'DESSERT', 'DRINK', 'OTHER'];
export const recipeCategoryMeta: Record<RecipeCategory, { label: string; icon: string }> = {
  BREAKFAST: { label: 'Frühstück', icon: '🥞' },
  MAIN: { label: 'Hauptgericht', icon: '🍽️' },
  SOUP: { label: 'Suppe', icon: '🍲' },
  SALAD: { label: 'Salat', icon: '🥗' },
  BAKING: { label: 'Backen', icon: '🧁' },
  SNACK: { label: 'Snack', icon: '🥪' },
  DESSERT: { label: 'Dessert', icon: '🍨' },
  DRINK: { label: 'Getränk', icon: '🥤' },
  OTHER: { label: 'Sonstiges', icon: '💡' }
};
