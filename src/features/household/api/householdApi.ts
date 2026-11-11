import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { HouseholdBoard, HouseholdChoreInput } from '../types/household';

export const getHouseholdBoard = (signal?: AbortSignal) => apiGet<HouseholdBoard>('/household-chores', signal);
export const createHouseholdChore = (input: HouseholdChoreInput) => apiPost<HouseholdBoard>('/household-chores', input);
export const updateHouseholdChore = (id: string, input: HouseholdChoreInput) => apiPut<HouseholdBoard>(`/household-chores/${id}`, input);
export const completeHouseholdChore = (id: string) => apiPost<HouseholdBoard>(`/household-chores/${id}/complete`, {});
export const deleteHouseholdChore = (id: string) => apiDelete<void>(`/household-chores/${id}`);
