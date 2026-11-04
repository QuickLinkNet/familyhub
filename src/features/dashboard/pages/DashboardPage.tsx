import { CalendarMonthRounded, CheckCircleRounded, GroupRounded, RestaurantRounded, ShoppingBasketRounded, SchoolRounded } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardCard } from '../../../components/molecules/DashboardCard';
import { useCalendarEvents } from '../../calendar/hooks/useCalendar';
import { useFamilyMembers } from '../../family/hooks/useFamilyMembers';
import { useTasks } from '../../tasks/hooks/useTasks';

const now = new Date();
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
const todayLabel = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
const timeLabel = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const greeting = now.getHours() < 11 ? 'Guten Morgen' : now.getHours() < 18 ? 'Hallo zusammen' : 'Guten Abend';
const initials = (name: string) => name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();

export function DashboardPage() {
  const events = useCalendarEvents(todayStart.toISOString(), tomorrowStart.toISOString());
  const tasks = useTasks();
  const family = useFamilyMembers();
  const todayEvents = events.data ?? [];
  const openTasks = (tasks.data ?? []).filter(task => task.status === 'OPEN');
  const completedTasks = (tasks.data ?? []).filter(task => task.status !== 'OPEN');
  const taskTotal = (tasks.data ?? []).length;
  const taskProgress = taskTotal === 0 ? 0 : Math.round(completedTasks.length / taskTotal * 100);
  const activeFamily = (family.data ?? []).filter(member => member.isActive);

  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <Box><Typography variant="h3" sx={{ fontSize: { xs: '2.15rem', md: '3.1rem' } }}>{greeting}</Typography><Typography color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '1rem', md: '1.125rem' }, textTransform: 'capitalize' }}>{todayLabel} · Alles Wichtige für eure Familie.</Typography></Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 2, md: 2.5 }, alignItems: 'stretch' }}>
      <DashboardCard title="Heute" icon={<CalendarMonthRounded color="primary" />} accent="#345b48">
        <Typography variant="h5">{events.isError ? 'Nicht verfügbar' : events.isLoading ? 'Wird geladen …' : `${todayEvents.length} ${todayEvents.length === 1 ? 'Termin' : 'Termine'}`}</Typography>
        <Stack mt={1} spacing={0.5}>{todayEvents.slice(0, 3).map(event => <Typography key={event.id} color="text.secondary" noWrap>{event.allDay ? 'Ganztägig' : timeLabel.format(new Date(event.startsAt))} · {event.title}</Typography>)}{events.isError ? <Typography color="error.main">Termine konnten nicht geladen werden.</Typography> : !events.isLoading && todayEvents.length === 0 && <Typography color="text.secondary">Heute steht noch nichts im Kalender.</Typography>}</Stack>
        <Button component={Link} to="/calendar" sx={{ mt: 2 }} variant="text">Kalender öffnen</Button>
      </DashboardCard>
      <DashboardCard title="Aufgaben" icon={<CheckCircleRounded color="success" />} accent="#4f8a62">
        <Stack direction="row" alignItems="baseline" spacing={1}><Typography variant="h3">{tasks.isLoading || tasks.isError ? '–' : openTasks.length}</Typography><Typography color="text.secondary">offen</Typography></Stack>
        <LinearProgress aria-label={`${completedTasks.length} von ${taskTotal} Aufgaben erledigt`} variant="determinate" value={taskProgress} color="success" sx={{ height: 10, borderRadius: 10, mt: 1.5 }} />
        <Typography color="text.secondary" mt={1}>{tasks.isError ? 'Aufgaben konnten nicht geladen werden' : taskTotal === 0 ? 'Noch keine Aufgaben angelegt' : `${completedTasks.length} von ${taskTotal} erledigt`}</Typography>
        <Button component={Link} to="/tasks" sx={{ mt: 1 }} variant="text">Aufgaben ansehen</Button>
      </DashboardCard>
      <DashboardCard title="Familie" icon={<GroupRounded color="secondary" />} accent="#d6855f">
        <Stack direction="row" spacing={-0.5} mb={1.5}>{activeFamily.slice(0, 6).map(member => <Avatar key={member.id} sx={{ bgcolor: member.color, border: '2px solid white' }}>{initials(member.name)}</Avatar>)}</Stack>
        <Typography variant="h6">{family.isError ? 'Nicht verfügbar' : family.isLoading ? 'Wird geladen …' : `${activeFamily.length} ${activeFamily.length === 1 ? 'Profil' : 'Profile'} aktiv`}</Typography>
        <Typography color="text.secondary" mt={0.5}>Rollen, Farben und Zugänge eurer Familie.</Typography>
        <Button component={Link} to="/family" sx={{ mt: 1 }} variant="text">Familie ansehen</Button>
      </DashboardCard>
      <ComingSoonCard title="Einkauf" icon={<ShoppingBasketRounded color="secondary" />} accent="#e0ad45" text="Gemeinsame Listen und schnelles Abhaken kommen als Nächstes." />
      <ComingSoonCard title="Essen" icon={<RestaurantRounded color="secondary" />} accent="#bd7558" text="Wochenplan und Familienrezepte sind auf der Roadmap." />
      <ComingSoonCard title="Schule & Routinen" icon={<SchoolRounded color="primary" />} accent="#6c8ab8" text="Stundenpläne, Routinen und Belohnungen folgen schrittweise." />
    </Box>
  </Stack>;
}

function ComingSoonCard({ title, icon, accent, text }: { title: string; icon: React.ReactNode; accent: string; text: string }) {
  return <DashboardCard title={title} icon={icon} accent={accent}><Chip size="small" label="In Vorbereitung" variant="outlined" /><Typography color="text.secondary" mt={1.5}>{text}</Typography></DashboardCard>;
}