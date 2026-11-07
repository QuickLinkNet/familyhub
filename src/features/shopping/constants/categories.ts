import type { ShoppingCategory } from '../types/shopping';

export const categoryMeta: Record<ShoppingCategory, { label: string; icon: string }> = {
  PRODUCE: { label: 'Obst & Gemüse', icon: '🥕' }, BAKERY: { label: 'Bäckerei', icon: '🥖' }, DAIRY: { label: 'Kühlregal', icon: '🥛' },
  MEAT: { label: 'Fleisch & Fisch', icon: '🥩' }, PANTRY: { label: 'Vorrat', icon: '🥫' }, FROZEN: { label: 'Tiefkühl', icon: '❄️' },
  DRINKS: { label: 'Getränke', icon: '🧃' }, HOUSEHOLD: { label: 'Haushalt', icon: '🧽' }, HYGIENE: { label: 'Pflege', icon: '🧴' }, OTHER: { label: 'Sonstiges', icon: '🛒' },
};
export const shoppingCategories = Object.keys(categoryMeta) as ShoppingCategory[];
