import { apiDelete, apiGet, apiPost } from '../../../services/apiClient';
import type { CreateRecipeInput, MealPlanner, PlanMealInput } from '../types/meal';

export const getMealPlanner = (from: string, to: string, signal?: AbortSignal) => apiGet<MealPlanner>(`/meal-planner?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, signal);
export const createRecipe = (input: CreateRecipeInput) => apiPost<MealPlanner>('/meal-recipes', input);
export const deleteRecipe = (id: string) => apiDelete<void>(`/meal-recipes/${id}`);
export const planMeal = (input: PlanMealInput) => apiPost<MealPlanner>('/meal-plan', input);
export const deleteMealEntry = (id: string) => apiDelete<void>(`/meal-plan/${id}`);
export const addRecipeToShopping = (id: string, listId: string) => apiPost<{ addedCount: number; recipeTitle: string; listId: string }>(`/meal-recipes/${id}/add-to-shopping`, { listId });
