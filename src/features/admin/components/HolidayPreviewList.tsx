import { EventRounded } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import type { HolidayEventPreview } from '../types/holiday';

const dateLabel = (event: HolidayEventPreview) => {
  const start = event.starts_at ?? event.startsAt ?? '';
  const end = event.ends_at ?? event.endsAt ?? start;
  if (!start) return '';
  const formatter = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' });
  const startDate = new Date(start);
  const inclusiveEnd = new Date(end);
  inclusiveEnd.setUTCDate(inclusiveEnd.getUTCDate() - 1);
  return startDate.toDateString() === inclusiveEnd.toDateString()
    ? formatter.format(startDate)
    : `${formatter.format(startDate)} – ${formatter.format(inclusiveEnd)}`;
};

export function HolidayPreviewList({ events, emptyLabel }: { events: HolidayEventPreview[]; emptyLabel: string }) {
  if (events.length === 0) return <Typography color="text.secondary">{emptyLabel}</Typography>;
  return (
    <List dense disablePadding>
      {events.map((event, index) => (
        <ListItem key={`${event.title}-${event.starts_at ?? event.startsAt}-${index}`} disableGutters>
          <ListItemIcon sx={{ minWidth: 36 }}><EventRounded color="primary" fontSize="small" /></ListItemIcon>
          <ListItemText primary={event.title} secondary={dateLabel(event)} />
        </ListItem>
      ))}
    </List>
  );
}

