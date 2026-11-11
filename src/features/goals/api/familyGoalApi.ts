import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { FamilyGoalBoard, FamilyGoalInput } from '../types/familyGoal';

export const getFamilyGoals = (signal?: AbortSignal) => apiGet<FamilyGoalBoard>('/family-goals', signal);
export const createFamilyGoal = (input: FamilyGoalInput) => apiPost<FamilyGoalBoard>('/family-goals', input);
export const updateFamilyGoal = (id: string, input: FamilyGoalInput) => apiPut<FamilyGoalBoard>(`/family-goals/${id}`, input);
export const contributeToFamilyGoal = (id: string, amount = 1) => apiPost<FamilyGoalBoard>(`/family-goals/${id}/contribute`, { amount });
export const deleteFamilyGoal = (id: string) => apiDelete<void>(`/family-goals/${id}`);
