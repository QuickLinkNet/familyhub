import type { ShoppingCategory } from '../../shopping/types/shopping';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';
export type RecipeCategory = 'BREAKFAST' | 'MAIN' | 'SOUP' | 'SALAD' | 'BAKING' | 'SNACK' | 'DESSERT' | 'DRINK' | 'OTHER';
export interface RecipeIngredient { id?: string; name: string; quantity: string; category: ShoppingCategory; }
export interface MealRecipe { id: string; title: string; description: string | null; icon: string; color: string; prepMinutes: number | null; servings: number; category: RecipeCategory; instructions: string[]; ingredients: RecipeIngredient[]; createdAt: string; updatedAt: string; }
export interface MealPlanEntry { id: string; date: string; mealType: MealType; recipeId: string | null; title: string; note: string | null; createdAt: string; updatedAt: string; }
export interface MealPlanner { recipes: MealRecipe[]; entries: MealPlanEntry[]; }
export interface RecipeInput { title: string; description: string; icon: string; color: string; prepMinutes: number | ''; servings: number; category: RecipeCategory; instructions: string[]; ingredients: RecipeIngredient[]; }
export interface PlanMealInput { date: string; mealType: MealType; recipeId: string | null; title: string; note: string; }
