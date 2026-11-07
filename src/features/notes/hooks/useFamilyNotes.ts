import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFamilyNote, deleteFamilyNote, getFamilyNotes, updateFamilyNote } from '../api/familyNoteApi';
import type { FamilyNoteInput } from '../types/familyNote';

export const familyNotesQueryKey = ['family-notes'] as const;
export const useFamilyNotes = () => useQuery({ queryKey: familyNotesQueryKey, queryFn: ({ signal }) => getFamilyNotes(signal) });

const notesMutation = <T,>(mutationFn: (input: T) => Promise<unknown>) => {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: familyNotesQueryKey }) });
};

export const useCreateFamilyNote = () => notesMutation((input: FamilyNoteInput) => createFamilyNote(input));
export const useUpdateFamilyNote = () => notesMutation((input: { id: string; note: FamilyNoteInput }) => updateFamilyNote(input.id, input.note));
export const useDeleteFamilyNote = () => notesMutation((id: string) => deleteFamilyNote(id));
