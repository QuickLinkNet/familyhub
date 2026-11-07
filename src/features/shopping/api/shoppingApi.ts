import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { CreateShoppingListInput, ShoppingItemInput, ShoppingList } from '../types/shopping';

export const getShoppingLists = (signal?: AbortSignal) => apiGet<ShoppingList[]>('/shopping-lists', signal);
export const createShoppingList = (input: CreateShoppingListInput) => apiPost<ShoppingList[]>('/shopping-lists', input);
export const deleteShoppingList = (id: string) => apiDelete<void>(`/shopping-lists/${id}`);
export const addShoppingItem = (listId: string, input: ShoppingItemInput) => apiPost<ShoppingList[]>(`/shopping-lists/${listId}/items`, input);
export const updateShoppingItem = (id: string, input: ShoppingItemInput) => apiPut<ShoppingList[]>(`/shopping-items/${id}`, input);
export const toggleShoppingItem = (id: string) => apiPost<ShoppingList[]>(`/shopping-items/${id}/toggle`, {});
export const deleteShoppingItem = (id: string) => apiDelete<void>(`/shopping-items/${id}`);
export const clearCheckedItems = (listId: string) => apiPost<ShoppingList[]>(`/shopping-lists/${listId}/clear-checked`, {});
