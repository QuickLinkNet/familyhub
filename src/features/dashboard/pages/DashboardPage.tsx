import { RestaurantRounded, SchoolRounded, ShoppingBasketRounded } from '@mui/icons-material';
import { Box, Stack } from '@mui/material';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { useCalendarEvents } from '../../calendar/hooks/useCalendar';
import { useFamilyMembers } from '../../family/hooks/useFamilyMembers';
import { useTasks } from '../../tasks/hooks/useTasks';
import { ComingSoonCard } from '../components/ComingSoonCard';
import { FamilySummaryCard } from '../components/FamilySummaryCard';
import { TasksSummaryCard } from '../components/TasksSummaryCard';
import { TodayCard } from '../components/TodayCard';

const now = new Date();
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
const todayLabel = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
const greeting = now.getHours() < 11 ? 'Guten Morgen' : now.getHours() < 18 ? 'Hallo zusammen' : 'Guten Abend';

export function DashboardPage() {
  const events = useCalendarEvents(todayStart.toISOString(), tomorrowStart.toISOString());
  const tasks = useTasks();
  const family = useFamilyMembers();
  const todayEvents = events.data ?? [];
  const openTasks = (tasks.data ?? []).filter(task => task.status === 'OPEN');
  const completedTasks = (tasks.data ?? []).filter(task => task.status !== 'OPEN');
  const activeFamily = (family.data ?? []).filter(member => member.isActive);

  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <PageHeader title={greeting} description={`${todayLabel} · Alles Wichtige für eure Familie.`} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 2, md: 2.5 }, alignItems: 'stretch' }}>
        <TodayCard events={todayEvents} loading={events.isLoading} error={events.isError} />
        <TasksSummaryCard openCount={openTasks.length} completedCount={completedTasks.length} totalCount={(tasks.data ?? []).length} loading={tasks.isLoading} error={tasks.isError} />
        <FamilySummaryCard members={activeFamily} loading={family.isLoading} error={family.isError} />
        <ComingSoonCard title="Einkauf" icon={<ShoppingBasketRounded color="secondary" />} accent="#e0ad45" text="Gemeinsame Listen und schnelles Abhaken kommen als Nächstes." />
        <ComingSoonCard title="Essen" icon={<RestaurantRounded color="secondary" />} accent="#bd7558" text="Wochenplan und Familienrezepte sind auf der Roadmap." />
        <ComingSoonCard title="Schule & Routinen" icon={<SchoolRounded color="primary" />} accent="#6c8ab8" text="Stundenpläne, Routinen und Belohnungen folgen schrittweise." />
      </Box>
    </Stack>
  );
}
