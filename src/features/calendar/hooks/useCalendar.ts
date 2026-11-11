import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCalendarEvent, deleteCalendarEvent, getCalendarEvents, getCalendars, updateCalendarEvent } from '../api/calendarApi';
import type { CalendarEventInput } from '../types/calendar';

export const calendarsKey = ['calendars'] as const;
export const calendarEventsKey = ['calendar-events'] as const;

export const useCalendars = () => useQuery({
  queryKey: calendarsKey,
  queryFn: ({ signal }) => getCalendars(signal),
  staleTime: 60_000
});

export const useCalendarEvents = (from: string, to: string) => useQuery({
  queryKey: [...calendarEventsKey, from, to],
  queryFn: ({ signal }) => getCalendarEvents(from, to, signal)
});

const refreshEvents = (client: ReturnType<typeof useQueryClient>) => {
  void client.invalidateQueries({ queryKey: calendarEventsKey });
  void client.invalidateQueries({ queryKey: ['reminders'] });
};

export const useCreateCalendarEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CalendarEventInput) => createCalendarEvent(input),
    onSuccess: () => refreshEvents(client)
  });
};

export const useUpdateCalendarEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CalendarEventInput }) => updateCalendarEvent(id, input),
    onSuccess: () => refreshEvents(client)
  });
};

export const useDeleteCalendarEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCalendarEvent(id),
    onSuccess: () => refreshEvents(client)
  });
};
