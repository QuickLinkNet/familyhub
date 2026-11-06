import { Box, Stack } from '@mui/material';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { useCalendarEvents } from '../../calendar/hooks/useCalendar';
import { useFamilyMembers } from '../../family/hooks/useFamilyMembers';
import { useTasks } from '../../tasks/hooks/useTasks';
import { isDueBy, localDate, wasCompletedOn } from '../../tasks/utils/taskDates';
import { AdminSetupCard } from '../components/AdminSetupCard';
import { FamilySummaryCard } from '../components/FamilySummaryCard';
import { TasksSummaryCard } from '../components/TasksSummaryCard';
import { TodayCard } from '../components/TodayCard';
import { WallModeCard } from '../components/WallModeCard';

const now = new Date();
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
const todayLabel = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
const greeting = now.getHours() < 11 ? 'Guten Morgen' : now.getHours() < 18 ? 'Hallo zusammen' : 'Guten Abend';

export function DashboardPage() {
  const events = useCalendarEvents(todayStart.toISOString(), tomorrowStart.toISOString());
  const tasks = useTasks();
  const family = useFamilyMembers();
  const session = useAuthSession();
  const todayEvents = events.data ?? [];
  const currentDate = localDate(now);
  const openTasks = (tasks.data ?? []).filter(task => task.status !== 'COMPLETED' && isDueBy(task, currentDate));
  const completedTasks = (tasks.data ?? []).filter(task => task.status === 'COMPLETED' && wasCompletedOn(task, currentDate));
  const activeFamily = (family.data ?? []).filter(member => member.isActive);

  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <PageHeader title={greeting} description={`${todayLabel} · Alles Wichtige für eure Familie.`} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 2, md: 2.5 }, alignItems: 'stretch' }}>
        <TodayCard events={todayEvents} loading={events.isLoading} error={events.isError} />
        <TasksSummaryCard openCount={openTasks.length} completedCount={completedTasks.length} totalCount={openTasks.length + completedTasks.length} loading={tasks.isLoading} error={tasks.isError} />
        <FamilySummaryCard members={activeFamily} loading={family.isLoading} error={family.isError} />
        <WallModeCard />
        {session.data?.user?.role === 'ADMIN' && <AdminSetupCard />}
      </Box>
    </Stack>
  );
}
