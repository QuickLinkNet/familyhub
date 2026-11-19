import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addRecipeToShopping, createRecipe, deleteMealEntry, deleteRecipe, getMealPlanner, planMeal, updateRecipe } from '../api/mealApi';
import type { PlanMealInput, RecipeInput } from '../types/meal';

export const useMealPlanner = (from: string, to: string) => useQuery({ queryKey: ['meal-planner', from, to], queryFn: ({ signal }) => getMealPlanner(from, to, signal) });
const mealMutation = <T,>(fn: (input: T) => Promise<unknown>) => { const client = useQueryClient(); return useMutation({ mutationFn: fn, onSuccess: () => client.invalidateQueries({ queryKey: ['meal-planner'] }) }); };
export const useCreateRecipe = () => mealMutation((input: RecipeInput) => createRecipe(input));
export const useUpdateRecipe = () => mealMutation((input: { id: string; recipe: RecipeInput }) => updateRecipe(input.id, input.recipe));
export const useDeleteRecipe = () => mealMutation((id: string) => deleteRecipe(id));
export const usePlanMeal = () => mealMutation((input: PlanMealInput) => planMeal(input));
export const useDeleteMealEntry = () => mealMutation((id: string) => deleteMealEntry(id));
export const useAddRecipeToShopping = () => { const client = useQueryClient(); return useMutation({ mutationFn: (input: { recipeId: string; listId: string; servings: number }) => addRecipeToShopping(input.recipeId, input.listId, input.servings), onSuccess: () => client.invalidateQueries({ queryKey: ['shopping-lists'] }) }); };
