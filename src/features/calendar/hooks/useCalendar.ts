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

export const useCreateCalendarEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CalendarEventInput) => createCalendarEvent(input),
    onSuccess: () => client.invalidateQueries({ queryKey: calendarEventsKey })
  });
};

export const useUpdateCalendarEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CalendarEventInput }) => updateCalendarEvent(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: calendarEventsKey })
  });
};

export const useDeleteCalendarEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCalendarEvent(id),
    onSuccess: () => client.invalidateQueries({ queryKey: calendarEventsKey })
  });
};
