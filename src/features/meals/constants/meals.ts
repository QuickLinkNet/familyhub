import type { MealType } from '../types/meal';

export const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];
export const mealMeta: Record<MealType, { label: string; shortLabel: string; icon: string }> = {
  BREAKFAST: { label: 'Frühstück', shortLabel: 'Früh', icon: '☕' },
  LUNCH: { label: 'Mittagessen', shortLabel: 'Mittag', icon: '🥗' },
  DINNER: { label: 'Abendessen', shortLabel: 'Abend', icon: '🍽️' },
};
