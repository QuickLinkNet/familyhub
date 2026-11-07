import { apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { CreateFamilyMemberInput, FamilyMember, UpdateFamilyMemberInput } from '../types/familyMember';

export const getFamilyMembers = (signal?: AbortSignal) => apiGet<FamilyMember[]>('/family-members', signal);
export const createFamilyMember = (input: CreateFamilyMemberInput) => apiPost<FamilyMember>('/family-members', input);
export const updateFamilyMember = (id: string, input: UpdateFamilyMemberInput) => apiPut<FamilyMember>(`/family-members/${id}`, input);
