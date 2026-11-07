import type { ShoppingCategory } from '../../shopping/types/shopping';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';
export interface RecipeIngredient { id?: string; name: string; quantity: string; category: ShoppingCategory; }
export interface MealRecipe { id: string; title: string; description: string | null; icon: string; color: string; prepMinutes: number | null; ingredients: RecipeIngredient[]; createdAt: string; updatedAt: string; }
export interface MealPlanEntry { id: string; date: string; mealType: MealType; recipeId: string | null; title: string; note: string | null; createdAt: string; updatedAt: string; }
export interface MealPlanner { recipes: MealRecipe[]; entries: MealPlanEntry[]; }
export interface CreateRecipeInput { title: string; description: string; icon: string; color: string; prepMinutes: number | ''; ingredients: RecipeIngredient[]; }
export interface PlanMealInput { date: string; mealType: MealType; recipeId: string | null; title: string; note: string; }
