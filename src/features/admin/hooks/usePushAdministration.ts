import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dispatchPushNow, getPushAdministration } from '../api/pushAdminApi';

export const pushAdministrationKey = ['push-administration'] as const;

export const usePushAdministration = (enabled = true) => useQuery({
  queryKey: pushAdministrationKey,
  queryFn: ({ signal }) => getPushAdministration(signal),
  enabled
});

export const useDispatchPush = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: dispatchPushNow, onSuccess: () => { void client.invalidateQueries({ queryKey: pushAdministrationKey }); } });
};
