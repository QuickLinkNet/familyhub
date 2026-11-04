import { apiGet, apiPost } from '../../../services/apiClient';
import type { CreateFamilyMemberInput, FamilyMember } from '../types/familyMember';

export const getFamilyMembers = (signal?: AbortSignal) => apiGet<FamilyMember[]>('/family-members', signal);
export const createFamilyMember = (input: CreateFamilyMemberInput) => apiPost<FamilyMember>('/family-members', input);
