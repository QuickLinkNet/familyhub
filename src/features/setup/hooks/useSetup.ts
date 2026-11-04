import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSetupStatus, installHousehold } from '../api/setupApi';
import type { SetupInput, SetupStatus } from '../types/setup';

export const setupStatusKey = ['setup-status'] as const;

export const useSetupStatus = () => useQuery({
  queryKey: setupStatusKey,
  queryFn: ({ signal }) => getSetupStatus(signal),
  staleTime: 15_000
});

export const useInstallHousehold = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: SetupInput) => installHousehold(input),
    onSuccess: installation => {
      const current = client.getQueryData<SetupStatus>(setupStatusKey);
      client.setQueryData<SetupStatus>(setupStatusKey, {
        required: false,
        completed: true,
        version: current?.version ?? 'unknown',
        installation
      });
      void client.invalidateQueries({ queryKey: ['family-members'] });
    },
  });
};
