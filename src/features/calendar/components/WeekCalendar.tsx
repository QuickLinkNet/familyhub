import { AddRounded } from '@mui/icons-material';
import { Box, Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import type { CalendarEvent } from '../types/calendar';
import { dayFormatter, eventsOnDay, isSameDay } from '../utils/calendarDates';
import { EventCard } from './EventCard';

interface WeekCalendarProps {
  days: Date[];
  events: CalendarEvent[];
  canManage: boolean;
  onCreate: (day: Date) => void;
  onOpen: (event: CalendarEvent) => void;
}

export function WeekCalendar({ days, events, canManage, onCreate, onOpen }: WeekCalendarProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(7, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'stretch' }}>
      {days.map(day => {
        const dayEvents = eventsOnDay(events, day);
        const today = isSameDay(day, new Date());
        return (
          <Card key={day.toISOString()} component="section" sx={{ minHeight: { md: 260 }, border: '1px solid', borderColor: today ? 'primary.main' : 'divider', bgcolor: today ? 'primary.light' : 'background.paper' }}>
            <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>{dayFormatter.format(day)}</Typography>
                {canManage && <IconButton size="small" aria-label={`Termin am ${dayFormatter.format(day)} hinzufügen`} onClick={() => onCreate(day)}><AddRounded fontSize="small" /></IconButton>}
              </Stack>
              <Stack spacing={1}>
                {dayEvents.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Keine Termine</Typography>}
                {dayEvents.map(event => <EventCard key={event.id} event={event} canManage={canManage} onOpen={() => onOpen(event)} />)}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
