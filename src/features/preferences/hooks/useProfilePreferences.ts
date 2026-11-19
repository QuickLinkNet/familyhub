import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfilePreferences, updateProfilePreferences } from '../api/profilePreferencesApi';

export const profilePreferencesKey = ['profile-preferences'] as const;

export const useProfilePreferences = () => useQuery({
  queryKey: profilePreferencesKey,
  queryFn: ({ signal }) => getProfilePreferences(signal),
  staleTime: 300_000,
});

export const useUpdateProfilePreferences = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateProfilePreferences,
    onSuccess: data => client.setQueryData(profilePreferencesKey, data),
  });
};
