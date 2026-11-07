import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFamilyMember, getFamilyMembers, updateFamilyMember } from '../api/familyApi';
import type { CreateFamilyMemberInput, UpdateFamilyMemberInput } from '../types/familyMember';

const queryKey = ['family-members'] as const;

export const useFamilyMembers = () => useQuery({
  queryKey,
  queryFn: ({ signal }) => getFamilyMembers(signal)
});

export const useCreateFamilyMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFamilyMemberInput) => createFamilyMember(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ['auth-profiles'] });
    }
  });
};

export const useUpdateFamilyMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFamilyMemberInput }) => updateFamilyMember(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ['auth-profiles'] });
      void queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    }
  });
};
