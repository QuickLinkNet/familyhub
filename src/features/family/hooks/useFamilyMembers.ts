import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFamilyMember, getFamilyMembers } from '../api/familyApi';
import type { CreateFamilyMemberInput } from '../types/familyMember';

const queryKey = ['family-members'] as const;

export const useFamilyMembers = () => useQuery({ queryKey, queryFn: ({ signal }) => getFamilyMembers(signal) });

export const useCreateFamilyMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFamilyMemberInput) => createFamilyMember(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });
};
