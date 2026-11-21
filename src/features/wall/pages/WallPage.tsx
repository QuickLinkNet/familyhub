import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Box, CircularProgress, Container, Stack } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
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
import { IdleWallReturnButton } from '../components/IdleWallReturnButton';
import { useIdleWallModeSettings } from '../hooks/useIdleWallModeSettings';
import { useScreenWakeLock } from '../hooks/useScreenWakeLock';
import { isDisplayScheduleActive } from '../services/displaySchedule';
import { WallNightMode } from '../components/WallNightMode';
import { AppearanceScope } from '../../../app/providers/AppearanceProvider';
import { useProfilePreferences } from '../../preferences/hooks/useProfilePreferences';
import { defaultWallCards } from '../../preferences/constants/profilePreferences';
import type { WallCardId } from '../../preferences/types/profilePreferences';
import { isQuietHoursActive } from '../../preferences/utils/quietHours';
import { useWallReminderSound } from '../../reminders/hooks/useWallReminderSound';

const defaultPresentation: WallPresentation = {
  greeting: 'Schön, dass ihr da seid', weatherEnabled: false, weatherLocation: null,
  weatherLatitude: null, weatherLongitude: null, photos: [], weather: null
};

export function WallPage() {
  const [searchParams] = useSearchParams();
  const enteredFromDeviceSetup = ['idle', 'setup'].includes(searchParams.get('source') ?? '');
  const { settings } = useIdleWallModeSettings();
  const [now, setNow] = useState(new Date());
  const [nightOverrideUntil, setNightOverrideUntil] = useState<number | null>(null);
  const scheduleActive = isDisplayScheduleActive(now, settings);
  const nightPreview = import.meta.env.DEV && searchParams.get('preview') === 'night';
  const outsideDisplaySchedule = (settings.scheduleEnabled && !scheduleActive) || nightPreview;
  const nightOverrideActive = outsideDisplaySchedule && (nightOverrideUntil ?? 0) > now.getTime();
  const nightMode = outsideDisplaySchedule && !nightOverrideActive;
  const wakeLock = useScreenWakeLock(settings.keepScreenAwake && !nightMode);
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
  const preferences = useProfilePreferences();
  const orderedCards = preferences.data?.wallCards ?? defaultWallCards;
  const visibleCards = new Set(orderedCards);
  const quietHours = preferences.data ? isQuietHoursActive(preferences.data, now) : false;
  useWallReminderSound(reminders.data, !quietHours);
  const openTasks = (tasks.data ?? []).filter(task => task.status !== 'COMPLETED' && isDueBy(task, localDate(now)));
  const activeFamily = (family.data ?? []).filter(member => member.isActive);
  const upcomingEvents = (events.data ?? []).filter(event => new Date(event.endsAt) > now);
  const loading = presentation.isLoading
    || (visibleCards.has('EVENTS') && events.isLoading)
    || (visibleCards.has('TASKS') && tasks.isLoading)
    || (visibleCards.has('FAMILY') && family.isLoading)
    || (visibleCards.has('NOTES') && notes.isLoading)
    || (visibleCards.has('SCHOOL') && school.isLoading)
    || (visibleCards.has('GOALS') && goals.isLoading)
    || (visibleCards.has('REMINDERS') && reminders.isLoading);
  const hasError = presentation.isError
    || (visibleCards.has('EVENTS') && events.isError)
    || (visibleCards.has('TASKS') && tasks.isError)
    || (visibleCards.has('FAMILY') && family.isError)
    || (visibleCards.has('NOTES') && notes.isError)
    || (visibleCards.has('SCHOOL') && school.isError)
    || (visibleCards.has('GOALS') && goals.isError)
    || (visibleCards.has('REMINDERS') && reminders.isError);
  const cards: Partial<Record<WallCardId, ReactNode>> = {
    EVENTS: <WallEvents events={upcomingEvents} />,
    TASKS: <WallTasks tasks={openTasks} />,
    REMINDERS: !quietHours && reminders.data?.items.length ? <WallReminders board={reminders.data} /> : null,
    GOALS: goals.data?.activeGoals[0] ? <WallGoal goal={goals.data.activeGoals[0]} /> : null,
    NOTES: <WallNotes notes={notes.data ?? []} />,
    SCHOOL: <WallSchool lessons={school.data?.lessons ?? []} items={school.data?.items ?? []} />,
    FAMILY: <WallFamily members={activeFamily} />,
  };
  const pairPrimaryCards = visibleCards.has('EVENTS') && visibleCards.has('TASKS');

  if (nightMode) {
    return (
      <AppearanceScope presentation="wall" scheme="night">
        <WallNightMode now={now} activeFrom={settings.activeFrom} showReturn={enteredFromDeviceSetup} onShowDay={() => setNightOverrideUntil(Date.now() + 30 * 60_000)} />
      </AppearanceScope>
    );
  }

  return (
    <AppearanceScope presentation="wall">
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', backgroundImage: 'radial-gradient(circle at top right, rgba(214,133,95,0.13), transparent 35%), radial-gradient(circle at bottom left, rgba(52,91,72,0.14), transparent 38%)', py: { xs: 2.5, md: 4 } }}>
        <Container maxWidth="xl">
          <Stack spacing={{ xs: 2.5, md: 3.5 }}>
            <WallHeader
              now={now}
              presentation={presentation.data ?? defaultPresentation}
              wakeLock={wakeLock}
              onResumeNight={nightOverrideActive ? () => setNightOverrideUntil(null) : undefined}
            />
            {hasError && <Alert severity="warning">Einige Familieninformationen konnten gerade nicht geladen werden.</Alert>}
            {loading
              ? <Stack alignItems="center" py={8}><CircularProgress /></Stack>
              : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: pairPrimaryCards ? '1.35fr 1fr' : '1fr' }, gap: { xs: 2, md: 2.5 }, alignItems: 'stretch' }}>
                {orderedCards.map(id => cards[id] ? <Box key={id} sx={{ gridColumn: { xs: '1', lg: pairPrimaryCards && ['EVENTS', 'TASKS'].includes(id) ? 'span 1' : '1 / -1' } }}>{cards[id]}</Box> : null)}
              </Box>}
          </Stack>
        </Container>
        {enteredFromDeviceSetup && <IdleWallReturnButton />}
      </Box>
    </AppearanceScope>
  );
}
