import { AddRounded } from '@mui/icons-material';
import { Box, Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import type { CalendarEvent } from '../types/calendar';
import { dayFormatter, eventsOnDay, isSameDay } from '../utils/calendarDates';
import { EventCard } from './EventCard';

interface FiveDayCalendarProps {
  days: Date[];
  events: CalendarEvent[];
  canManage: boolean;
  onCreate: (day: Date) => void;
  onOpen: (event: CalendarEvent) => void;
}

function orderedEvents(events: CalendarEvent[]) {
  return [...events].sort((left, right) => {
    if (left.allDay !== right.allDay) return left.allDay ? -1 : 1;
    return left.startsAt.localeCompare(right.startsAt);
  });
}

export function FiveDayCalendar({ days, events, canManage, onCreate, onOpen }: FiveDayCalendarProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'stretch' }}>
      {days.map(day => {
        const dayEvents = orderedEvents(eventsOnDay(events, day));
        const today = isSameDay(day, new Date());
        return (
          <Card key={day.toISOString()} component="section" sx={{ minHeight: { md: 300 }, border: '1px solid', borderColor: today ? 'primary.main' : 'divider', bgcolor: today ? 'primary.light' : 'background.paper' }}>
            <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography component="h2" variant="subtitle2" sx={{ textTransform: 'capitalize' }} aria-current={today ? 'date' : undefined}>{dayFormatter.format(day)}</Typography>
                {canManage && <IconButton size="small" aria-label={`Termin am ${dayFormatter.format(day)} hinzufügen`} onClick={() => onCreate(day)}><AddRounded fontSize="small" /></IconButton>}
              </Stack>
              <Stack spacing={1}>
                {dayEvents.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Keine Termine</Typography>}
                {dayEvents.map(event => <EventCard key={event.id} event={event} day={day} canManage={canManage} onOpen={() => onOpen(event)} />)}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
