import { AddRounded } from '@mui/icons-material';
import { Box, ButtonBase, Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import type { CalendarEvent } from '../types/calendar';
import { dayFormatter, eventsOnDay, fullDayFormatter, isSameDay, isSameMonth, weekdayLabels } from '../utils/calendarDates';
import { EventCard } from './EventCard';

interface MonthCalendarProps {
  days: Date[];
  month: Date;
  events: CalendarEvent[];
  selectedDay: Date;
  canManage: boolean;
  onSelectDay: (day: Date) => void;
  onCreate: (day: Date) => void;
  onOpen: (event: CalendarEvent) => void;
}

export function MonthCalendar(props: MonthCalendarProps) {
  const { days, month, events, selectedDay, canManage, onSelectDay, onCreate, onOpen } = props;
  const selectedEvents = eventsOnDay(events, selectedDay);

  return (
    <Stack spacing={2}>
      <DesktopMonthGrid days={days} month={month} events={events} canManage={canManage} onCreate={onCreate} onOpen={onOpen} />
      <MobileMonthGrid days={days} month={month} events={events} selectedDay={selectedDay} selectedEvents={selectedEvents} canManage={canManage} onSelectDay={onSelectDay} onCreate={onCreate} onOpen={onOpen} />
    </Stack>
  );
}

type MonthGridProps = Omit<MonthCalendarProps, 'selectedDay' | 'onSelectDay'>;

function DesktopMonthGrid({ days, month, events, canManage, onCreate, onOpen }: MonthGridProps) {
  return (
    <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1 }}>
      {weekdayLabels.map(label => <Typography key={label} variant="subtitle2" color="text.secondary" textAlign="center" py={0.5}>{label}</Typography>)}
      {days.map(day => {
        const dayEvents = eventsOnDay(events, day);
        const inMonth = isSameMonth(day, month);
        const today = isSameDay(day, new Date());
        return (
          <Card key={day.toISOString()} component="section" aria-label={fullDayFormatter.format(day)} sx={{ minHeight: 156, border: '1px solid', borderColor: today ? 'primary.main' : 'divider', bgcolor: today ? 'primary.light' : inMonth ? 'background.paper' : 'action.hover', opacity: inMonth ? 1 : 0.62 }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="subtitle2" aria-current={today ? 'date' : undefined}>{day.getDate()}</Typography>
                {canManage && <IconButton size="small" aria-label={`Termin am ${dayFormatter.format(day)} hinzufügen`} onClick={() => onCreate(day)}><AddRounded fontSize="small" /></IconButton>}
              </Stack>
              <Stack spacing={0.5}>
                {dayEvents.slice(0, 3).map(event => <EventCard key={event.id} event={event} day={day} canManage={canManage} compact onOpen={() => onOpen(event)} />)}
                {dayEvents.length > 3 && <Typography variant="caption" color="text.secondary">+{dayEvents.length - 3} weitere</Typography>}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

interface MobileMonthGridProps extends MonthCalendarProps {
  selectedEvents: CalendarEvent[];
}

function MobileMonthGrid({ days, month, events, selectedDay, selectedEvents, canManage, onSelectDay, onCreate, onOpen }: MobileMonthGridProps) {
  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Card>
        <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 0.5 }}>
            {weekdayLabels.map(label => <Typography key={label} variant="caption" color="text.secondary" textAlign="center" fontWeight={700}>{label}</Typography>)}
            {days.map(day => {
              const dayEvents = eventsOnDay(events, day);
              const today = isSameDay(day, new Date());
              const selected = isSameDay(day, selectedDay);
              return (
                <ButtonBase key={day.toISOString()} aria-label={`${fullDayFormatter.format(day)}, ${dayEvents.length} ${dayEvents.length === 1 ? 'Termin' : 'Termine'}`} aria-pressed={selected} onClick={() => onSelectDay(day)} sx={{ minWidth: 0, minHeight: 54, borderRadius: 2, border: '1px solid', borderColor: selected ? 'primary.main' : 'transparent', bgcolor: selected ? 'primary.light' : 'transparent', opacity: isSameMonth(day, month) ? 1 : 0.45, flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2" fontWeight={today || selected ? 800 : 600} aria-current={today ? 'date' : undefined}>{day.getDate()}</Typography>
                  <Stack direction="row" gap={0.35} minHeight={6}>
                    {dayEvents.slice(0, 3).map(event => <Box key={event.id} sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: event.calendar.color }} />)}
                  </Stack>
                </ButtonBase>
              );
            })}
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ mt: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>{fullDayFormatter.format(selectedDay)}</Typography>
            {canManage && <IconButton aria-label={`Termin am ${dayFormatter.format(selectedDay)} hinzufügen`} onClick={() => onCreate(selectedDay)}><AddRounded /></IconButton>}
          </Stack>
          <Stack spacing={1}>
            {selectedEvents.length === 0 && <Typography color="text.secondary">Keine Termine an diesem Tag.</Typography>}
            {selectedEvents.map(event => <EventCard key={event.id} event={event} day={selectedDay} canManage={canManage} onOpen={() => onOpen(event)} />)}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
