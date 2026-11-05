import { LocationOnRounded } from '@mui/icons-material';
import { Box, CardActionArea, Chip, Stack, Typography } from '@mui/material';
import type { CalendarEvent } from '../types/calendar';
import { timeFormatter } from '../utils/calendarDates';

interface EventCardProps {
  event: CalendarEvent;
  canManage: boolean;
  onOpen: () => void;
  compact?: boolean;
}

export function EventCard({ event, canManage, onOpen, compact = false }: EventCardProps) {
  const content = (
    <Box sx={{ borderLeft: `5px solid ${event.calendar.color}`, pl: 1, py: 0.25, textAlign: 'left' }}>
      <Typography variant="subtitle2" lineHeight={1.25} noWrap={compact}>{event.title}</Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {event.allDay ? 'Ganztägig' : `${timeFormatter.format(new Date(event.startsAt))} – ${timeFormatter.format(new Date(event.endsAt))}`}
      </Typography>
      {!compact && event.location && (
        <Stack direction="row" alignItems="center" gap={0.25} mt={0.25}>
          <LocationOnRounded sx={{ fontSize: 14 }} color="action" />
          <Typography variant="caption" color="text.secondary" noWrap>{event.location}</Typography>
        </Stack>
      )}
      {!compact && <Chip label={event.calendar.name} size="small" sx={{ mt: 0.75, height: 22, bgcolor: `${event.calendar.color}1F` }} />}
    </Box>
  );

  return canManage
    ? <CardActionArea onClick={onOpen} sx={{ borderRadius: 2, p: 0.5, minHeight: compact ? 44 : undefined }}>{content}</CardActionArea>
    : content;
}
