import { Box, Skeleton } from '@mui/material';
import type { CalendarView } from './CalendarHeader';

export function CalendarLoadingGrid({ days, view }: { days: Date[]; view: CalendarView }) {
  const singleDay = view === 'day' || view === 'timeline';
  const count = singleDay ? 1 : view === 'five-day' ? 5 : view === 'week' ? 7 : 14;
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: view === 'five-day' ? 'repeat(5, minmax(0, 1fr))' : view === 'week' || view === 'month' ? 'repeat(7, minmax(0, 1fr))' : '1fr' }, gap: 1.5 }}>
      {days.slice(0, count).map(day => (
        <Skeleton key={day.toISOString()} variant="rounded" height={singleDay ? 420 : view === 'five-day' || view === 'week' ? 220 : 150} />
      ))}
    </Box>
  );
}
