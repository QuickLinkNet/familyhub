import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completeHouseholdChore, createHouseholdChore, deleteHouseholdChore, getHouseholdBoard, updateHouseholdChore } from '../api/householdApi';
import type { HouseholdChoreInput } from '../types/household';

export const householdBoardKey = ['household-board'] as const;
export const useHouseholdBoard = () => useQuery({ queryKey: householdBoardKey, queryFn: ({ signal }) => getHouseholdBoard(signal) });
const householdMutation = <T,>(fn: (input: T) => Promise<unknown>) => { const client = useQueryClient(); return useMutation({ mutationFn: fn, onSuccess: () => client.invalidateQueries({ queryKey: householdBoardKey }) }); };
export const useCreateHouseholdChore = () => householdMutation((input: HouseholdChoreInput) => createHouseholdChore(input));
export const useUpdateHouseholdChore = () => householdMutation(({ id, input }: { id: string; input: HouseholdChoreInput }) => updateHouseholdChore(id, input));
export const useCompleteHouseholdChore = () => householdMutation((id: string) => completeHouseholdChore(id));
export const useDeleteHouseholdChore = () => householdMutation((id: string) => deleteHouseholdChore(id));
