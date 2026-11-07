import { AddRounded, CakeRounded, EventBusyRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import { designTokens } from '../../../theme/designTokens';
import type { CalendarEvent } from '../types/calendar';
import { eventsOnDay, fullDayFormatter, timeFormatter } from '../utils/calendarDates';
import { EventCard } from './EventCard';

interface DayCalendarProps {
  day: Date;
  events: CalendarEvent[];
  canManage: boolean;
  onCreate: (day: Date) => void;
  onOpen: (event: CalendarEvent) => void;
}

export function DayCalendar({ day, events, canManage, onCreate, onOpen }: DayCalendarProps) {
  const dayEvents = eventsOnDay(events, day).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const allDay = dayEvents.filter(event => event.allDay);
  const scheduled = dayEvents.filter(event => !event.allDay);

  return (
    <Card component="section">
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5} mb={2.5}>
          <Box>
            <Typography variant="overline" color="primary.main" fontWeight={800}>Tagesplan</Typography>
            <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>{fullDayFormatter.format(day)}</Typography>
          </Box>
          {canManage && <Button variant="contained" startIcon={<AddRounded />} onClick={() => onCreate(day)}>Termin anlegen</Button>}
        </Stack>

        {allDay.length > 0 && (
          <Stack spacing={1} sx={{ p: 1.5, mb: 2.5, borderRadius: 3, bgcolor: designTokens.surface.warm }}>
            <Typography variant="subtitle2">Ganztägig</Typography>
            {allDay.map(event => (
              <Stack key={event.id} direction="row" alignItems="center" gap={1}>
                {event.source === 'BIRTHDAY' && <CakeRounded color="secondary" fontSize="small" />}
                <Box flex={1}><EventCard event={event} day={day} canManage={canManage} onOpen={() => onOpen(event)} /></Box>
              </Stack>
            ))}
          </Stack>
        )}

        {scheduled.length === 0 ? (
          <Stack alignItems="center" py={5} spacing={1} color="text.secondary">
            <EventBusyRounded sx={{ fontSize: 48 }} />
            <Typography fontWeight={700}>Noch keine Termine mit Uhrzeit</Typography>
            <Typography variant="body2">Der Tag hat noch Raum für gemeinsame Pläne.</Typography>
          </Stack>
        ) : (
          <Stack divider={<Divider flexItem />}>
            {scheduled.map(event => (
              <Stack key={event.id} direction="row" gap={{ xs: 1.5, sm: 3 }} py={1.5} alignItems="flex-start">
                <Chip label={timeFormatter.format(new Date(event.startsAt))} size="small" sx={{ minWidth: 70, mt: 0.5, fontWeight: 800 }} />
                <Box flex={1} minWidth={0}><EventCard event={event} day={day} canManage={canManage} onOpen={() => onOpen(event)} /></Box>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
