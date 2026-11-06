import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calendarEventsKey, calendarsKey } from '../../calendar/hooks/useCalendar';
import { authorizeGoogleConnection, configureGoogleConnection, disconnectGoogleConnection, getGoogleConnection, syncGoogleCalendarSource, updateGoogleCalendarSource } from '../api/googleCalendarApi';
import type { GoogleOAuthConfigInput } from '../types/googleCalendar';

export const googleConnectionKey = ['google-calendar-connection'] as const;

export const useGoogleConnection = (enabled = true) => useQuery({
  queryKey: googleConnectionKey,
  queryFn: ({ signal }) => getGoogleConnection(signal),
  enabled
});

function useGoogleMutation<T>(mutationFn: (value: T) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: googleConnectionKey });
      void client.invalidateQueries({ queryKey: calendarsKey });
      void client.invalidateQueries({ queryKey: calendarEventsKey });
    }
  });
}

export const useConfigureGoogle = () => useGoogleMutation((input: GoogleOAuthConfigInput) => configureGoogleConnection(input));
export const useAuthorizeGoogle = () => useMutation({ mutationFn: authorizeGoogleConnection });
export const useToggleGoogleCalendar = () => useGoogleMutation(({ id, isActive }: { id: string; isActive: boolean }) => updateGoogleCalendarSource(id, isActive));
export const useSyncGoogleCalendar = () => useGoogleMutation((id: string) => syncGoogleCalendarSource(id));
export const useDisconnectGoogle = () => useGoogleMutation(() => disconnectGoogleConnection());
