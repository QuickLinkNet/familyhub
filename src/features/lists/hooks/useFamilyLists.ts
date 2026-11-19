import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clearCompletedFamilyListItems, createFamilyList, createFamilyListItem, deleteFamilyList, deleteFamilyListItem, getFamilyLists, toggleFamilyListItem, updateFamilyList, updateFamilyListItem } from '../api/familyListApi';
import type { FamilyListInput, FamilyListItemInput } from '../types/familyList';

export const familyListsQueryKey = ['family-lists'] as const;
export const useFamilyLists = () => useQuery({ queryKey: familyListsQueryKey, queryFn: ({ signal }) => getFamilyLists(signal) });

const listMutation = <T,>(mutationFn: (input: T) => Promise<unknown>) => {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: familyListsQueryKey }) });
};

export const useCreateFamilyList = () => listMutation((input: FamilyListInput) => createFamilyList(input));
export const useUpdateFamilyList = () => listMutation((input: { id: string; list: FamilyListInput }) => updateFamilyList(input.id, input.list));
export const useDeleteFamilyList = () => listMutation((id: string) => deleteFamilyList(id));
export const useCreateFamilyListItem = () => listMutation((input: { listId: string; item: FamilyListItemInput }) => createFamilyListItem(input.listId, input.item));
export const useUpdateFamilyListItem = () => listMutation((input: { id: string; item: FamilyListItemInput }) => updateFamilyListItem(input.id, input.item));
export const useToggleFamilyListItem = () => listMutation((id: string) => toggleFamilyListItem(id));
export const useDeleteFamilyListItem = () => listMutation((id: string) => deleteFamilyListItem(id));
export const useClearCompletedFamilyListItems = () => listMutation((id: string) => clearCompletedFamilyListItems(id));
