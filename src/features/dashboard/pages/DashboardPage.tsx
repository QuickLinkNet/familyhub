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
import { RewardsSummaryCard } from '../components/RewardsSummaryCard';
import { useRewards } from '../../rewards/hooks/useRewards';
import { useShoppingLists } from '../../shopping/hooks/useShopping';
import { ShoppingSummaryCard } from '../components/ShoppingSummaryCard';
import { MealsSummaryCard } from '../components/MealsSummaryCard';
import { useMealPlanner } from '../../meals/hooks/useMeals';
import { addDays, weekStart as mealWeekStart } from '../../meals/utils/mealDates';
import { useFamilyNotes } from '../../notes/hooks/useFamilyNotes';
import { NotesSummaryCard } from '../components/NotesSummaryCard';
import { useSchoolBoard } from '../../school/hooks/useSchool';
import { SchoolSummaryCard } from '../components/SchoolSummaryCard';
import { useHouseholdBoard } from '../../household/hooks/useHousehold';
import { HouseholdSummaryCard } from '../components/HouseholdSummaryCard';
import { useFamilyGoals } from '../../goals/hooks/useFamilyGoals';
import { FamilyGoalSummaryCard } from '../components/FamilyGoalSummaryCard';

const now = new Date();
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
const todayLabel = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
const greeting = now.getHours() < 11 ? 'Guten Morgen' : now.getHours() < 18 ? 'Hallo zusammen' : 'Guten Abend';
const currentWeekStart = mealWeekStart(now);

export function DashboardPage() {
  const events = useCalendarEvents(todayStart.toISOString(), tomorrowStart.toISOString());
  const tasks = useTasks();
  const family = useFamilyMembers();
  const session = useAuthSession();
  const rewards = useRewards();
  const shopping = useShoppingLists();
  const meals = useMealPlanner(localDate(currentWeekStart), localDate(addDays(currentWeekStart, 6)));
  const notes = useFamilyNotes();
  const school = useSchoolBoard(localDate(now), localDate(addDays(now, 14)));
  const household = useHouseholdBoard();
  const goals = useFamilyGoals();
  const todayEvents = events.data ?? [];
  const currentDate = localDate(now);
  const openTasks = (tasks.data ?? []).filter(task => task.status !== 'COMPLETED' && isDueBy(task, currentDate));
  const completedTasks = (tasks.data ?? []).filter(task => task.status === 'COMPLETED' && wasCompletedOn(task, currentDate));
  const activeFamily = (family.data ?? []).filter(member => member.isActive);
  const ownPoints = rewards.data?.balances.find(balance => balance.member.id === session.data?.user?.id)?.points ?? 0;
  const shoppingOpen = (shopping.data ?? []).reduce((count, list) => count + list.items.filter(item => !item.isChecked).length, 0);
  const todayMeals = (meals.data?.entries ?? []).filter(entry => entry.date === currentDate);

  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <PageHeader title={greeting} description={`${todayLabel} · Alles Wichtige für eure Familie.`} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 2, md: 2.5 }, alignItems: 'stretch' }}>
        <TodayCard events={todayEvents} loading={events.isLoading} error={events.isError} />
        <TasksSummaryCard openCount={openTasks.length} completedCount={completedTasks.length} totalCount={openTasks.length + completedTasks.length} loading={tasks.isLoading} error={tasks.isError} />
        <FamilySummaryCard members={activeFamily} loading={family.isLoading} error={family.isError} />
        <RewardsSummaryCard points={ownPoints} loading={rewards.isLoading} error={rewards.isError} />
        <ShoppingSummaryCard openCount={shoppingOpen} listCount={shopping.data?.length ?? 0} loading={shopping.isLoading} error={shopping.isError} />
        <MealsSummaryCard entries={todayMeals} loading={meals.isLoading} error={meals.isError} />
        <NotesSummaryCard notes={notes.data ?? []} loading={notes.isLoading} error={notes.isError} />
        <SchoolSummaryCard board={school.data} loading={school.isLoading} error={school.isError} />
        <HouseholdSummaryCard board={household.data} loading={household.isLoading} error={household.isError} />
        <FamilyGoalSummaryCard board={goals.data} loading={goals.isLoading} error={goals.isError} />
        <WallModeCard />
        {session.data?.user?.role === 'ADMIN' && <AdminSetupCard />}
      </Box>
    </Stack>
  );
}
