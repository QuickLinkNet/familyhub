import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { FamilyList, FamilyListInput, FamilyListItemInput } from '../types/familyList';

export const getFamilyLists = (signal?: AbortSignal) => apiGet<FamilyList[]>('/lists', signal);
export const createFamilyList = (input: FamilyListInput) => apiPost<FamilyList[]>('/lists', input);
export const updateFamilyList = (id: string, input: FamilyListInput) => apiPut<FamilyList[]>(`/lists/${id}`, input);
export const deleteFamilyList = (id: string) => apiDelete<void>(`/lists/${id}`);
export const createFamilyListItem = (listId: string, input: FamilyListItemInput) => apiPost<FamilyList[]>(`/lists/${listId}/items`, input);
export const updateFamilyListItem = (id: string, input: FamilyListItemInput) => apiPut<FamilyList[]>(`/list-items/${id}`, input);
export const toggleFamilyListItem = (id: string) => apiPost<FamilyList[]>(`/list-items/${id}/toggle`, {});
export const deleteFamilyListItem = (id: string) => apiDelete<void>(`/list-items/${id}`);
export const clearCompletedFamilyListItems = (listId: string) => apiPost<FamilyList[]>(`/lists/${listId}/clear-completed`, {});
