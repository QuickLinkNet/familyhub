import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { EventAvailableRounded } from '@mui/icons-material';
import { Alert, Stack } from '@mui/material';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { useFamilyMembers } from '../../family/hooks/useFamilyMembers';
import { useProfilePreferences, useUpdateProfilePreferences } from '../../preferences/hooks/useProfilePreferences';
import { CalendarFilters } from '../components/CalendarFilters';
import { CalendarHeader, type CalendarView } from '../components/CalendarHeader';
import { CalendarLoadingGrid } from '../components/CalendarLoadingGrid';
import { CalendarPeriodNavigation } from '../components/CalendarPeriodNavigation';
import { DayCalendar } from '../components/DayCalendar';
import { EventDialog } from '../components/EventDialog';
import { MonthCalendar } from '../components/MonthCalendar';
import { WeekCalendar } from '../components/WeekCalendar';
import { useCalendarEvents, useCalendars } from '../hooks/useCalendar';
import type { CalendarEvent } from '../types/calendar';
import { addDays, daysBetween, endOfMonth, fullDayFormatter, isSameMonth, monthFormatter, monthTitleFormatter, startOfDay, startOfMonth, startOfWeek } from '../utils/calendarDates';
import { eventMatchesSearch } from '../utils/calendarSearch';

function sameIds(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export function CalendarPage() {
  const [view, setView] = useState<CalendarView>('week');
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [createDate, setCreateDate] = useState<Date | null>(null);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [calendarIds, setCalendarIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [preferenceApplied, setPreferenceApplied] = useState(false);
  const weekStart = startOfWeek(cursor);
  const weekEnd = addDays(weekStart, 7);
  const monthStart = startOfMonth(cursor);
  const monthGridStart = startOfWeek(monthStart);
  const monthGridEnd = addDays(startOfWeek(endOfMonth(cursor)), 7);
  const periodStart = view === 'day' ? cursor : view === 'week' ? weekStart : monthGridStart;
  const periodEnd = view === 'day' ? addDays(cursor, 1) : view === 'week' ? weekEnd : monthGridEnd;
  const events = useCalendarEvents(periodStart.toISOString(), periodEnd.toISOString());
  const calendars = useCalendars();
  const family = useFamilyMembers();
  const preferences = useProfilePreferences();
  const updatePreferences = useUpdateProfilePreferences();
  const session = useAuthSession();
  const canManage = session.data?.user?.role !== 'CHILD';
  const activeFamily = (family.data ?? []).filter(member => member.isActive);
  const days = daysBetween(periodStart, periodEnd);
  const calendarOptions = useMemo(() => {
    const options = new Map<string, { id: string; name: string; color: string }>();
    for (const calendar of calendars.data ?? []) options.set(calendar.id, calendar);
    for (const event of events.data ?? []) options.set(event.calendar.id, event.calendar);
    return [...options.values()];
  }, [calendars.data, events.data]);
  const chipFilteredEvents = (events.data ?? []).filter(event =>
    (calendarIds.length === 0 || calendarIds.includes(event.calendar.id))
    && (memberIds.length === 0 || (event.members ?? []).some(member => memberIds.includes(member.id)))
  );
  const filteredEvents = chipFilteredEvents.filter(event => eventMatchesSearch(event, search));
  const searchActive = search.trim().length > 0;
  const filtersActive = memberIds.length > 0 || calendarIds.length > 0 || searchActive;
  const savedView = (preferences.data?.calendarView ?? 'WEEK').toLowerCase() as CalendarView;
  const defaultSaved = preferences.data !== undefined
    && view === savedView
    && sameIds(memberIds, preferences.data.calendarMemberIds ?? [])
    && sameIds(calendarIds, preferences.data.calendarIds ?? []);
  const periodLabel = view === 'day'
    ? fullDayFormatter.format(cursor)
    : view === 'week'
      ? `${monthFormatter.format(weekStart)} – ${monthFormatter.format(addDays(weekEnd, -1))}`
      : monthTitleFormatter.format(monthStart);
  const periodNoun = view === 'day' ? 'Tag' : view === 'week' ? 'Woche' : 'Monat';

  useEffect(() => {
    if (preferenceApplied || preferences.data === undefined) return;
    setView((preferences.data.calendarView ?? 'WEEK').toLowerCase() as CalendarView);
    setMemberIds(preferences.data.calendarMemberIds ?? []);
    setCalendarIds(preferences.data.calendarIds ?? []);
    setPreferenceApplied(true);
  }, [preferenceApplied, preferences.data]);

  const openCreate = (day = new Date()) => {
    setSelectedEvent(null);
    setCreateDate(day);
  };
  const openEvent = (event: CalendarEvent) => {
    setCreateDate(null);
    setSelectedEvent(event);
  };
  const closeDialog = () => {
    setSelectedEvent(null);
    setCreateDate(null);
  };
  const changeView = (_event: MouseEvent<HTMLElement>, nextView: CalendarView | null) => {
    if (nextView === null) return;
    setView(nextView);
    setSelectedDay(startOfDay(cursor));
  };
  const changePeriod = (direction: -1 | 1) => {
    if (view === 'day') {
      setCursor(current => addDays(current, direction));
      return;
    }
    if (view === 'week') {
      setCursor(current => addDays(current, direction * 7));
      return;
    }
    setCursor(current => {
      const next = new Date(current.getFullYear(), current.getMonth() + direction, 1);
      const today = startOfDay(new Date());
      setSelectedDay(isSameMonth(next, today) ? today : next);
      return next;
    });
  };
  const goToday = () => {
    const today = startOfDay(new Date());
    setCursor(today);
    setSelectedDay(today);
  };
  const saveDefault = () => updatePreferences.mutate({
    calendarView: view.toUpperCase() as 'DAY' | 'WEEK' | 'MONTH',
    calendarMemberIds: memberIds,
    calendarIds
  });

  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <CalendarHeader view={view} canManage={canManage} onViewChange={changeView} onCreate={() => openCreate()} />
      <CalendarPeriodNavigation view={view} label={periodLabel} onPrevious={() => changePeriod(-1)} onNext={() => changePeriod(1)} onToday={goToday} />
      <CalendarFilters
        members={activeFamily}
        calendars={calendarOptions}
        memberIds={memberIds}
        calendarIds={calendarIds}
        search={search}
        searchResultCount={filteredEvents.length}
        searchTotalCount={chipFilteredEvents.length}
        onMembersChange={setMemberIds}
        onCalendarsChange={setCalendarIds}
        onSearchChange={setSearch}
        defaultSaved={defaultSaved}
        loadingDefault={preferences.isLoading}
        savingDefault={updatePreferences.isPending}
        onSaveDefault={saveDefault}
      />
      {events.isError && <Alert severity="error">{events.error instanceof ApiError ? events.error.message : 'Die Termine konnten nicht geladen werden.'}</Alert>}
      {calendars.isError && <Alert severity="error">{calendars.error instanceof ApiError ? calendars.error.message : 'Die Kalender konnten nicht geladen werden.'}</Alert>}
      {family.isError && <Alert severity="error">Die Familienprofile konnten nicht geladen werden.</Alert>}
      {preferences.isError && <Alert severity="error">Dein Kalenderstandard konnte nicht geladen werden.</Alert>}
      {updatePreferences.isError && <Alert severity="error">Dein Kalenderstandard konnte nicht gespeichert werden.</Alert>}
      {events.isLoading
        ? <CalendarLoadingGrid days={days} view={view} />
        : view === 'day'
          ? <DayCalendar day={cursor} events={filteredEvents} canManage={canManage} onCreate={openCreate} onOpen={openEvent} />
          : view === 'week'
            ? <WeekCalendar days={days} events={filteredEvents} canManage={canManage} onCreate={openCreate} onOpen={openEvent} />
            : <MonthCalendar days={days} month={monthStart} events={filteredEvents} selectedDay={selectedDay} canManage={canManage} onSelectDay={setSelectedDay} onCreate={openCreate} onOpen={openEvent} />}
      {!events.isLoading && filteredEvents.length === 0 && (
        <EmptyStateCard
          icon={<EventAvailableRounded color="primary" sx={{ fontSize: 52 }} />}
          title={searchActive ? 'Keine passenden Termine' : filtersActive ? 'Keine Termine für diese Auswahl' : `Dieser ${periodNoun} ist noch frei`}
          description={searchActive ? 'Versuche einen anderen Suchbegriff oder setze die Filter zurück.' : filtersActive ? 'Passt die Personen- oder Kalenderfilter an.' : canManage ? 'Tragt euren ersten gemeinsamen oder persönlichen Termin ein.' : `Für diesen ${periodNoun} sind keine Termine eingetragen.`}
        />
      )}
      {(createDate !== null || selectedEvent !== null) && canManage && (
        <EventDialog
          event={selectedEvent}
          initialDate={createDate ?? new Date()}
          calendars={(calendars.data ?? []).filter(calendar => calendar.writable)}
          members={activeFamily}
          currentUserId={session.data?.user?.id ?? null}
          onClose={closeDialog}
        />
      )}
    </Stack>
  );
}
