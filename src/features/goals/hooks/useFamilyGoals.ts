import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contributeToFamilyGoal, createFamilyGoal, deleteFamilyGoal, getFamilyGoals, updateFamilyGoal } from '../api/familyGoalApi';
import type { FamilyGoalInput } from '../types/familyGoal';

export const familyGoalsKey = ['family-goals'] as const;
export const useFamilyGoals = () => useQuery({ queryKey: familyGoalsKey, queryFn: ({ signal }) => getFamilyGoals(signal) });

function useGoalMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: familyGoalsKey }) });
}

export const useCreateFamilyGoal = () => useGoalMutation((input: FamilyGoalInput) => createFamilyGoal(input));
export const useUpdateFamilyGoal = () => useGoalMutation(({ id, input }: { id: string; input: FamilyGoalInput }) => updateFamilyGoal(id, input));
export const useContributeFamilyGoal = () => useGoalMutation((id: string) => contributeToFamilyGoal(id));
export const useDeleteFamilyGoal = () => useGoalMutation((id: string) => deleteFamilyGoal(id));
