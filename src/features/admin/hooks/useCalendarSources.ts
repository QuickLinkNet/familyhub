import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calendarEventsKey, calendarsKey } from '../../calendar/hooks/useCalendar';
import { createCalendarSource, deleteCalendarSource, getCalendarSources, syncCalendarSource, updateCalendarSource } from '../api/calendarSourceApi';
import type { CalendarSourceInput } from '../types/calendarSource';

export const calendarSourcesKey = ['calendar-sources'] as const;

export const useCalendarSources = (enabled = true) => useQuery({
  queryKey: calendarSourcesKey,
  queryFn: ({ signal }) => getCalendarSources(signal),
  enabled
});

function useSourceMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: calendarSourcesKey });
      void client.invalidateQueries({ queryKey: calendarsKey });
      void client.invalidateQueries({ queryKey: calendarEventsKey });
    }
  });
}

export const useCreateCalendarSource = () => useSourceMutation((input: CalendarSourceInput) => createCalendarSource(input));
export const useUpdateCalendarSource = () => useSourceMutation(({ id, input }: { id: string; input: CalendarSourceInput }) => updateCalendarSource(id, input));
export const useSyncCalendarSource = () => useSourceMutation((id: string) => syncCalendarSource(id));
export const useDeleteCalendarSource = () => useSourceMutation((id: string) => deleteCalendarSource(id));
