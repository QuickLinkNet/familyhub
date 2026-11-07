import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addRecipeToShopping, createRecipe, deleteMealEntry, deleteRecipe, getMealPlanner, planMeal } from '../api/mealApi';
import type { CreateRecipeInput, PlanMealInput } from '../types/meal';

export const useMealPlanner = (from: string, to: string) => useQuery({ queryKey: ['meal-planner', from, to], queryFn: ({ signal }) => getMealPlanner(from, to, signal) });
const mealMutation = <T,>(fn: (input: T) => Promise<unknown>) => { const client = useQueryClient(); return useMutation({ mutationFn: fn, onSuccess: () => client.invalidateQueries({ queryKey: ['meal-planner'] }) }); };
export const useCreateRecipe = () => mealMutation((input: CreateRecipeInput) => createRecipe(input));
export const useDeleteRecipe = () => mealMutation((id: string) => deleteRecipe(id));
export const usePlanMeal = () => mealMutation((input: PlanMealInput) => planMeal(input));
export const useDeleteMealEntry = () => mealMutation((id: string) => deleteMealEntry(id));
export const useAddRecipeToShopping = () => { const client = useQueryClient(); return useMutation({ mutationFn: (input: { recipeId: string; listId: string }) => addRecipeToShopping(input.recipeId, input.listId), onSuccess: () => client.invalidateQueries({ queryKey: ['shopping-lists'] }) }); };
