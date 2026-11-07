import { Box, Skeleton } from '@mui/material';
import type { CalendarView } from './CalendarHeader';

export function CalendarLoadingGrid({ days, view }: { days: Date[]; view: CalendarView }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(7, minmax(0, 1fr))' }, gap: 1.5 }}>
      {days.slice(0, view === 'day' ? 1 : view === 'week' ? 7 : 14).map(day => (
        <Skeleton key={day.toISOString()} variant="rounded" height={view === 'day' ? 420 : view === 'week' ? 220 : 150} />
      ))}
    </Box>
  );
}
