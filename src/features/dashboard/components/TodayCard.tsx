import { CalendarMonthRounded } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardCard } from '../../../components/molecules/DashboardCard';
import type { CalendarEvent } from '../../calendar/types/calendar';

const timeLabel = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

interface TodayCardProps {
  events: CalendarEvent[];
  loading: boolean;
  error: boolean;
}

export function TodayCard({ events, loading, error }: TodayCardProps) {
  const countLabel = `${events.length} ${events.length === 1 ? 'Termin' : 'Termine'}`;
  return (
    <DashboardCard title="Heute" icon={<CalendarMonthRounded color="primary" />} accent="#345b48">
      <Typography variant="h5">{error ? 'Nicht verfügbar' : loading ? 'Wird geladen …' : countLabel}</Typography>
      <Stack mt={1} spacing={0.5}>
        {events.slice(0, 3).map(event => <Typography key={event.id} color="text.secondary" noWrap>{event.allDay ? 'Ganztägig' : timeLabel.format(new Date(event.startsAt))} · {event.title}</Typography>)}
        {error ? <Typography color="error.main">Termine konnten nicht geladen werden.</Typography> : !loading && events.length === 0 && <Typography color="text.secondary">Heute steht noch nichts im Kalender.</Typography>}
      </Stack>
      <Button component={Link} to="/calendar" sx={{ mt: 2 }} variant="text">Kalender öffnen</Button>
    </DashboardCard>
  );
}
