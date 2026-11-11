import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Container, Stack } from '@mui/material';
import { useCalendarEvents } from '../../calendar/hooks/useCalendar';
import { addDays, startOfDay } from '../../calendar/utils/calendarDates';
import { useFamilyMembers } from '../../family/hooks/useFamilyMembers';
import { useTasks } from '../../tasks/hooks/useTasks';
import { isDueBy, localDate } from '../../tasks/utils/taskDates';
import { WallEvents } from '../components/WallEvents';
import { WallFamily } from '../components/WallFamily';
import { WallHeader } from '../components/WallHeader';
import { WallTasks } from '../components/WallTasks';
import { useFamilyNotes } from '../../notes/hooks/useFamilyNotes';
import { WallNotes } from '../components/WallNotes';
import { useSchoolBoard } from '../../school/hooks/useSchool';
import { WallSchool } from '../components/WallSchool';
import { useWallPresentation } from '../hooks/useWallPresentation';
import type { WallPresentation } from '../types/wallPresentation';
import { useFamilyGoals } from '../../goals/hooks/useFamilyGoals';
import { WallGoal } from '../components/WallGoal';
import { useReminders } from '../../reminders/hooks/useReminders';
import { WallReminders } from '../../reminders/components/WallReminders';

const defaultPresentation: WallPresentation = {
  greeting: 'Schön, dass ihr da seid', weatherEnabled: false, weatherLocation: null,
  weatherLatitude: null, weatherLongitude: null, photos: [], weather: null
};

export function WallPage() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const range = useMemo(() => {
    const start = startOfDay(now);
    return { start, end: addDays(start, 7) };
  }, [now]);
  const events = useCalendarEvents(range.start.toISOString(), range.end.toISOString());
  const tasks = useTasks();
  const family = useFamilyMembers();
  const notes = useFamilyNotes();
  const school = useSchoolBoard(localDate(now), localDate(addDays(now, 14)));
  const presentation = useWallPresentation();
  const goals = useFamilyGoals();
  const reminders = useReminders();
  const openTasks = (tasks.data ?? []).filter(task => task.status !== 'COMPLETED' && isDueBy(task, localDate(now)));
  const activeFamily = (family.data ?? []).filter(member => member.isActive);
  const upcomingEvents = (events.data ?? []).filter(event => new Date(event.endsAt) > now);
  const loading = events.isLoading || tasks.isLoading || family.isLoading || notes.isLoading || school.isLoading || presentation.isLoading || goals.isLoading || reminders.isLoading;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', backgroundImage: 'radial-gradient(circle at top right, rgba(214,133,95,0.13), transparent 35%), radial-gradient(circle at bottom left, rgba(52,91,72,0.14), transparent 38%)', py: { xs: 2.5, md: 4 } }}>
      <Container maxWidth="xl">
        <Stack spacing={{ xs: 2.5, md: 3.5 }}>
          <WallHeader now={now} presentation={presentation.data ?? defaultPresentation} />
          {(events.isError || tasks.isError || family.isError || notes.isError || school.isError || presentation.isError || goals.isError || reminders.isError) && <Alert severity="warning">Einige Familieninformationen konnten gerade nicht geladen werden.</Alert>}
          {loading
            ? <Stack alignItems="center" py={8}><CircularProgress /></Stack>
            : <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.35fr 1fr' }, gap: { xs: 2, md: 2.5 }, alignItems: 'stretch' }}>
                <WallEvents events={upcomingEvents} />
                <WallTasks tasks={openTasks} />
              </Box>
              <WallReminders board={reminders.data} />
              <WallGoal goal={goals.data?.activeGoals[0]} />
              <WallNotes notes={notes.data ?? []} />
              <WallSchool lessons={school.data?.lessons ?? []} items={school.data?.items ?? []} />
              <WallFamily members={activeFamily} />
            </>}
        </Stack>
      </Container>
    </Box>
  );
}
