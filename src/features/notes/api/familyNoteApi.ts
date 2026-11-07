import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { FamilyNote, FamilyNoteInput } from '../types/familyNote';

export const getFamilyNotes = (signal?: AbortSignal) => apiGet<FamilyNote[]>('/family-notes', signal);
export const createFamilyNote = (input: FamilyNoteInput) => apiPost<FamilyNote[]>('/family-notes', input);
export const updateFamilyNote = (id: string, input: FamilyNoteInput) => apiPut<FamilyNote[]>(`/family-notes/${id}`, input);
export const deleteFamilyNote = (id: string) => apiDelete<void>(`/family-notes/${id}`);
