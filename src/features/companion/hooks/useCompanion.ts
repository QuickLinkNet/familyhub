import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authSessionKey } from '../../auth/hooks/useAuth';
import { createMobileInvitation, getAuthDevices, getInvitationPreview, redeemMobileInvitation, revokeAuthDevice } from '../api/companionApi';

const devicesKey = ['auth-devices'] as const;

export const useCreateMobileInvitation = () => useMutation({ mutationFn: createMobileInvitation });

export const useInvitationPreview = (token: string) => useQuery({
  queryKey: ['mobile-invitation', token],
  queryFn: ({ signal }) => getInvitationPreview(token, signal),
  enabled: token !== '',
  retry: false,
  staleTime: 15_000
});

export const useRedeemMobileInvitation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ token, deviceLabel }: { token: string; deviceLabel: string }) => redeemMobileInvitation(token, deviceLabel),
    onSuccess: session => {
      client.setQueryData(authSessionKey, session);
      void client.invalidateQueries({ queryKey: ['family-members'] });
      void client.invalidateQueries({ queryKey: ['reminders'] });
    }
  });
};

export const useAuthDevices = (enabled: boolean) => useQuery({
  queryKey: devicesKey,
  queryFn: ({ signal }) => getAuthDevices(signal),
  enabled
});

export const useRevokeAuthDevice = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: revokeAuthDevice, onSuccess: () => client.invalidateQueries({ queryKey: devicesKey }) });
};
