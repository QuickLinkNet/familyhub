import { AddRounded, ScheduleRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { CalendarEvent } from '../types/calendar';
import { addDays, eventsOnDay, fullDayFormatter, isSameDay, startOfDay, timeFormatter } from '../utils/calendarDates';
import { EventCard } from './EventCard';

interface TimelineCalendarProps {
  day: Date;
  events: CalendarEvent[];
  canManage: boolean;
  onCreate: (day: Date) => void;
  onOpen: (event: CalendarEvent) => void;
}

function visibleHour(event: CalendarEvent, day: Date, boundary: 'start' | 'end') {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  const source = new Date(boundary === 'start' ? event.startsAt : event.endsAt);
  const clipped = boundary === 'start'
    ? new Date(Math.max(source.getTime(), dayStart.getTime()))
    : new Date(Math.min(source.getTime(), dayEnd.getTime()));
  if (clipped.getTime() >= dayEnd.getTime()) return 24;
  return clipped.getHours() + clipped.getMinutes() / 60;
}

function hourRange(events: CalendarEvent[], day: Date) {
  const now = new Date();
  const currentHour = isSameDay(day, now) ? now.getHours() : null;
  const start = Math.min(events.length === 0 ? 6 : Math.min(6, ...events.map(event => Math.floor(visibleHour(event, day, 'start')))), currentHour ?? 24);
  const end = Math.max(events.length === 0 ? 22 : Math.max(22, ...events.map(event => Math.ceil(visibleHour(event, day, 'end')))), currentHour === null ? 0 : currentHour + 1);
  return Array.from({ length: Math.max(1, end - start) }, (_, index) => start + index);
}

interface TimelineGroup {
  hour: number;
  events: CalendarEvent[];
  end: number;
}

function timelineGroups(events: CalendarEvent[], day: Date) {
  const groups: TimelineGroup[] = [];
  for (const event of events) {
    const start = visibleHour(event, day, 'start');
    const end = visibleHour(event, day, 'end');
    const current = groups.at(-1);
    if (current && start < current.end) {
      current.events.push(event);
      current.end = Math.max(current.end, end);
    } else {
      groups.push({ hour: Math.floor(start), events: [event], end });
    }
  }
  return groups;
}

export function TimelineCalendar({ day, events, canManage, onCreate, onOpen }: TimelineCalendarProps) {
  const dayEvents = eventsOnDay(events, day).sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  const allDay = dayEvents.filter(event => event.allDay);
  const scheduled = dayEvents.filter(event => !event.allDay);
  const hours = hourRange(scheduled, day);
  const groups = timelineGroups(scheduled, day);
  const now = new Date();
  const currentHour = isSameDay(day, now) ? now.getHours() : null;

  return (
    <Card component="section">
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5} mb={2.5}>
          <Box>
            <Typography variant="overline" color="primary.main" fontWeight={800}>Timeline</Typography>
            <Typography component="h2" variant="h5" sx={{ textTransform: 'capitalize' }}>{fullDayFormatter.format(day)}</Typography>
          </Box>
          {canManage && <Button variant="contained" startIcon={<AddRounded />} onClick={() => onCreate(day)}>Termin anlegen</Button>}
        </Stack>

        {allDay.length > 0 && (
          <Stack spacing={1} sx={{ p: 1.5, mb: 2, bgcolor: 'action.hover', borderRadius: theme => theme.familyHub.radius.md }}>
            <Typography variant="subtitle2">Ganztägig</Typography>
            {allDay.map(event => <EventCard key={event.id} event={event} day={day} canManage={canManage} onOpen={() => onOpen(event)} />)}
          </Stack>
        )}

        <Box aria-label={`Zeitplan für ${fullDayFormatter.format(day)}`}>
          {hours.map(hour => {
            const hourGroups = groups.filter(group => group.hour === hour);
            const hasEvents = hourGroups.length > 0;
            const current = currentHour === hour;
            return (
              <Box key={hour} sx={{ display: 'grid', gridTemplateColumns: theme => `${theme.spacing(7)} minmax(0, 1fr)`, borderTop: '1px solid', borderColor: current ? 'primary.main' : 'divider', minHeight: theme => theme.familyHub.touchTarget }}>
                <Typography variant="caption" color={current ? 'primary.main' : 'text.secondary'} fontWeight={current ? 800 : 600} sx={{ pt: 1 }}>{String(hour).padStart(2, '0')}:00</Typography>
                <Box sx={{ py: 0.75, minWidth: 0 }}>
                  {current && <Chip icon={<ScheduleRounded />} label={`Jetzt ${timeFormatter.format(now)}`} color="primary" size="small" sx={{ mb: hasEvents ? 0.75 : 0 }} />}
                  <Stack spacing={0.75}>
                    {hourGroups.map((group, index) => (
                      <Box key={`${hour}-${index}`} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: group.events.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr' }, gap: 0.75 }}>
                        {group.events.map(event => (
                          <Card key={event.id} variant="outlined" sx={{ borderColor: event.calendar.color }}>
                            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                              <EventCard event={event} day={day} canManage={canManage} onOpen={() => onOpen(event)} compact />
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
