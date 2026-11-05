import { CalendarMonthRounded, LocationOnRounded } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { CalendarEvent } from '../../calendar/types/calendar';

const dayLabel = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
const timeLabel = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

export function WallEvents({ events }: { events: CalendarEvent[] }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
        <Stack direction="row" alignItems="center" gap={1} mb={2.5}><CalendarMonthRounded color="primary" /><Typography variant="h5">Die nächsten Termine</Typography></Stack>
        {events.length === 0
          ? <Typography color="text.secondary">In den nächsten sieben Tagen steht noch nichts an.</Typography>
          : <Stack spacing={1.5}>{events.slice(0, 7).map(event => (
            <Box key={event.id} sx={{ borderLeft: `6px solid ${event.calendar.color}`, pl: 1.5, py: 0.75 }}>
              <Stack direction="row" justifyContent="space-between" gap={2} alignItems="flex-start">
                <div><Typography variant="h6" lineHeight={1.25}>{event.title}</Typography><Typography color="text.secondary">{event.allDay ? `${dayLabel.format(new Date(event.startsAt))} · Ganztägig` : `${dayLabel.format(new Date(event.startsAt))} · ${timeLabel.format(new Date(event.startsAt))}`}</Typography></div>
                <Chip size="small" label={event.calendar.name} sx={{ bgcolor: `${event.calendar.color}1F` }} />
              </Stack>
              {event.location && <Stack direction="row" gap={0.5} alignItems="center" mt={0.5}><LocationOnRounded color="action" fontSize="small" /><Typography variant="body2" color="text.secondary">{event.location}</Typography></Stack>}
            </Box>
          ))}</Stack>}
      </CardContent>
    </Card>
  );
}
