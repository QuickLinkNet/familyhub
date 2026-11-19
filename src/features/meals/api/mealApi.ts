import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { MealPlanner, PlanMealInput, RecipeInput } from '../types/meal';

export const getMealPlanner = (from: string, to: string, signal?: AbortSignal) => apiGet<MealPlanner>(`/meal-planner?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, signal);
export const createRecipe = (input: RecipeInput) => apiPost<MealPlanner>('/meal-recipes', input);
export const updateRecipe = (id: string, input: RecipeInput) => apiPut<MealPlanner>(`/meal-recipes/${id}`, input);
export const deleteRecipe = (id: string) => apiDelete<void>(`/meal-recipes/${id}`);
export const planMeal = (input: PlanMealInput) => apiPost<MealPlanner>('/meal-plan', input);
export const deleteMealEntry = (id: string) => apiDelete<void>(`/meal-plan/${id}`);
export const addRecipeToShopping = (id: string, listId: string, servings: number) => apiPost<{ addedCount: number; recipeTitle: string; listId: string; servings: number }>(`/meal-recipes/${id}/add-to-shopping`, { listId, servings });
