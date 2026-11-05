import { useState, type MouseEvent } from 'react';
import { EventAvailableRounded } from '@mui/icons-material';
import { Alert, Stack } from '@mui/material';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { CalendarHeader, type CalendarView } from '../components/CalendarHeader';
import { CalendarLoadingGrid } from '../components/CalendarLoadingGrid';
import { CalendarPeriodNavigation } from '../components/CalendarPeriodNavigation';
import { EventDialog } from '../components/EventDialog';
import { MonthCalendar } from '../components/MonthCalendar';
import { WeekCalendar } from '../components/WeekCalendar';
import { useCalendarEvents, useCalendars } from '../hooks/useCalendar';
import type { CalendarEvent } from '../types/calendar';
import { addDays, daysBetween, endOfMonth, isSameMonth, monthFormatter, monthTitleFormatter, startOfDay, startOfMonth, startOfWeek } from '../utils/calendarDates';

export function CalendarPage() {
  const [view, setView] = useState<CalendarView>('week');
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [createDate, setCreateDate] = useState<Date | null>(null);
  const weekStart = startOfWeek(cursor);
  const weekEnd = addDays(weekStart, 7);
  const monthStart = startOfMonth(cursor);
  const monthGridStart = startOfWeek(monthStart);
  const monthGridEnd = addDays(startOfWeek(endOfMonth(cursor)), 7);
  const periodStart = view === 'week' ? weekStart : monthGridStart;
  const periodEnd = view === 'week' ? weekEnd : monthGridEnd;
  const events = useCalendarEvents(periodStart.toISOString(), periodEnd.toISOString());
  const calendars = useCalendars();
  const session = useAuthSession();
  const canManage = session.data?.user?.role !== 'CHILD';
  const days = daysBetween(periodStart, periodEnd);
  const periodLabel = view === 'week'
    ? `${monthFormatter.format(weekStart)} – ${monthFormatter.format(addDays(weekEnd, -1))}`
    : monthTitleFormatter.format(monthStart);
  const periodNoun = view === 'week' ? 'Woche' : 'Monat';

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

  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <CalendarHeader view={view} canManage={canManage} onViewChange={changeView} onCreate={() => openCreate()} />
      <CalendarPeriodNavigation view={view} label={periodLabel} onPrevious={() => changePeriod(-1)} onNext={() => changePeriod(1)} onToday={goToday} />
      {events.isError && <Alert severity="error">{events.error instanceof ApiError ? events.error.message : 'Die Termine konnten nicht geladen werden.'}</Alert>}
      {calendars.isError && <Alert severity="error">{calendars.error instanceof ApiError ? calendars.error.message : 'Die Kalender konnten nicht geladen werden.'}</Alert>}
      {events.isLoading
        ? <CalendarLoadingGrid days={days} view={view} />
        : view === 'week'
          ? <WeekCalendar days={days} events={events.data ?? []} canManage={canManage} onCreate={openCreate} onOpen={openEvent} />
          : <MonthCalendar days={days} month={monthStart} events={events.data ?? []} selectedDay={selectedDay} canManage={canManage} onSelectDay={setSelectedDay} onCreate={openCreate} onOpen={openEvent} />}
      {!events.isLoading && events.data?.length === 0 && (
        <EmptyStateCard
          icon={<EventAvailableRounded color="primary" sx={{ fontSize: 52 }} />}
          title={`Dieser ${periodNoun} ist noch frei`}
          description={canManage ? 'Tragt euren ersten gemeinsamen oder persönlichen Termin ein.' : `Für diesen ${periodNoun} sind keine Termine eingetragen.`}
        />
      )}
      {(createDate !== null || selectedEvent !== null) && canManage && (
        <EventDialog event={selectedEvent} initialDate={createDate ?? new Date()} calendars={(calendars.data ?? []).filter(calendar => calendar.type !== 'EXTERNAL')} onClose={closeDialog} />
      )}
    </Stack>
  );
}
