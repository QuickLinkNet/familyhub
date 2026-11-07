import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addShoppingItem, clearCheckedItems, createShoppingList, deleteShoppingItem, deleteShoppingList, getShoppingLists, toggleShoppingItem } from '../api/shoppingApi';
import type { CreateShoppingListInput, ShoppingItemInput } from '../types/shopping';

export const shoppingQueryKey = ['shopping-lists'] as const;
export const useShoppingLists = () => useQuery({ queryKey: shoppingQueryKey, queryFn: ({ signal }) => getShoppingLists(signal) });
const mutation = <T,>(fn: (input: T) => Promise<unknown>) => { const client = useQueryClient(); return useMutation({ mutationFn: fn, onSuccess: () => client.invalidateQueries({ queryKey: shoppingQueryKey }) }); };
export const useCreateShoppingList = () => mutation((input: CreateShoppingListInput) => createShoppingList(input));
export const useDeleteShoppingList = () => mutation((id: string) => deleteShoppingList(id));
export const useAddShoppingItem = () => mutation((input: { listId: string; item: ShoppingItemInput }) => addShoppingItem(input.listId, input.item));
export const useToggleShoppingItem = () => mutation((id: string) => toggleShoppingItem(id));
export const useDeleteShoppingItem = () => mutation((id: string) => deleteShoppingItem(id));
export const useClearCheckedItems = () => mutation((listId: string) => clearCheckedItems(listId));
