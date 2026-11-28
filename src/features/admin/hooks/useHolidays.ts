import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calendarEventsKey, calendarsKey } from '../../calendar/hooks/useCalendar';
import { configureHolidays, getHolidayStatus, previewHolidays, removeHolidays, syncHolidays } from '../api/holidayApi';
import type { HolidaySettingsInput } from '../types/holiday';

export const holidayStatusKey = ['holiday-status'] as const;

export const useHolidayStatus = (enabled = true) => useQuery({
  queryKey: holidayStatusKey,
  queryFn: ({ signal }) => getHolidayStatus(signal),
  enabled
});

export const useHolidayPreview = () => useMutation({ mutationFn: (input: HolidaySettingsInput) => previewHolidays(input) });

function useHolidayMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: holidayStatusKey });
      void client.invalidateQueries({ queryKey: calendarsKey });
      void client.invalidateQueries({ queryKey: calendarEventsKey });
    }
  });
}

export const useConfigureHolidays = () => useHolidayMutation((input: HolidaySettingsInput) => configureHolidays(input));
export const useSyncHolidays = () => useHolidayMutation(() => syncHolidays());
export const useRemoveHolidays = () => useHolidayMutation(() => removeHolidays());

