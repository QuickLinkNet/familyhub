import { useState, type FormEvent, type MouseEvent } from 'react';
import { AddRounded, CalendarViewMonthRounded, ChevronLeftRounded, ChevronRightRounded, EventAvailableRounded, LocationOnRounded, ViewWeekRounded } from '@mui/icons-material';
import { Alert, Box, Button, ButtonBase, Card, CardActionArea, CardContent, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Skeleton, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { useCalendarEvents, useCalendars, useCreateCalendarEvent, useDeleteCalendarEvent, useUpdateCalendarEvent } from '../hooks/useCalendar';
import type { CalendarEvent, CalendarEventInput } from '../types/calendar';

const dayFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
const monthFormatter = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
const monthTitleFormatter = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
const fullDayFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
const timeFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const weekdayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const startOfWeek = (date: Date) => addDays(startOfDay(date), -((date.getDay() + 6) % 7));
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const localDateTime = (date: Date) => `${localDate(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};
const isSameDay = (a: Date, b: Date) => localDate(a) === localDate(b);
const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const daysBetween = (from: Date, to: Date) => {
  const days: Date[] = [];
  for (let day = from; day < to; day = addDays(day, 1)) days.push(day);
  return days;
};
const eventsOnDay = (events: CalendarEvent[], day: Date) => {
  const dayEnd = addDays(day, 1);
  return events.filter(event => new Date(event.startsAt) < dayEnd && new Date(event.endsAt) > day);
};

type CalendarView = 'week' | 'month';

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
  const previousPeriodLabel = view === 'week' ? 'Vorherige Woche' : 'Vorheriger Monat';
  const nextPeriodLabel = view === 'week' ? 'Nächste Woche' : 'Nächster Monat';

  const openCreate = (day = new Date()) => {
    setSelectedEvent(null);
    setCreateDate(day);
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

  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
      <Box><Typography variant="h3" sx={{ fontSize: { xs: '2.15rem', md: '3.1rem' } }}>Familienkalender</Typography><Typography color="text.secondary" mt={0.5}>Alle Termine und persönlichen Kalender auf einen Blick.</Typography></Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
        <ToggleButtonGroup exclusive value={view} onChange={changeView} aria-label="Kalenderansicht" size="small" sx={{ '& .MuiToggleButton-root': { minHeight: 48, px: 2, flex: { xs: 1, sm: 'initial' }, textTransform: 'none', fontWeight: 700 } }}>
          <ToggleButton value="week" aria-label="Wochenansicht"><ViewWeekRounded sx={{ mr: 1 }} />Woche</ToggleButton>
          <ToggleButton value="month" aria-label="Monatsansicht"><CalendarViewMonthRounded sx={{ mr: 1 }} />Monat</ToggleButton>
        </ToggleButtonGroup>
        {canManage && <Button variant="contained" startIcon={<AddRounded />} onClick={() => openCreate()}>Termin hinzufügen</Button>}
      </Stack>
    </Stack>

    <Card>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5}>
          <Stack direction="row" alignItems="center" justifyContent={{ xs: 'space-between', sm: 'flex-start' }} gap={0.5}>
            <IconButton aria-label={previousPeriodLabel} onClick={() => changePeriod(-1)}><ChevronLeftRounded /></IconButton>
            <Typography variant="h6" sx={{ minWidth: { sm: 260 }, textAlign: 'center', textTransform: view === 'month' ? 'capitalize' : 'none' }}>{periodLabel}</Typography>
            <IconButton aria-label={nextPeriodLabel} onClick={() => changePeriod(1)}><ChevronRightRounded /></IconButton>
          </Stack>
          <Button variant="outlined" onClick={goToday}>Heute</Button>
        </Stack>
      </CardContent>
    </Card>

    {events.isError && <Alert severity="error">{events.error instanceof ApiError ? events.error.message : 'Die Termine konnten nicht geladen werden.'}</Alert>}
    {calendars.isError && <Alert severity="error">{calendars.error instanceof ApiError ? calendars.error.message : 'Die Kalender konnten nicht geladen werden.'}</Alert>}

    {events.isLoading
      ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(7, minmax(0, 1fr))' }, gap: 1.5 }}>{days.slice(0, view === 'week' ? 7 : 14).map(day => <Skeleton key={day.toISOString()} variant="rounded" height={view === 'week' ? 220 : 150} />)}</Box>
      : view === 'week'
        ? <WeekView days={days} events={events.data ?? []} canManage={canManage} onCreate={openCreate} onOpen={event => { setCreateDate(null); setSelectedEvent(event); }} />
        : <MonthView days={days} month={monthStart} events={events.data ?? []} selectedDay={selectedDay} canManage={canManage} onSelectDay={setSelectedDay} onCreate={openCreate} onOpen={event => { setCreateDate(null); setSelectedEvent(event); }} />}

    {!events.isLoading && events.data?.length === 0 && <Card><CardContent sx={{ py: 5, textAlign: 'center' }}><EventAvailableRounded color="primary" sx={{ fontSize: 52 }} /><Typography variant="h5" mt={1}>Dieser {periodNoun} ist noch frei</Typography><Typography color="text.secondary" mt={0.5}>{canManage ? 'Tragt euren ersten gemeinsamen oder persönlichen Termin ein.' : `Für diesen ${periodNoun} sind keine Termine eingetragen.`}</Typography></CardContent></Card>}

    {(createDate !== null || selectedEvent !== null) && canManage && <EventDialog event={selectedEvent} initialDate={createDate ?? new Date()} calendars={calendars.data ?? []} onClose={closeDialog} />}
  </Stack>;
}

function WeekView({ days, events, canManage, onCreate, onOpen }: { days: Date[]; events: CalendarEvent[]; canManage: boolean; onCreate: (day: Date) => void; onOpen: (event: CalendarEvent) => void }) {
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(7, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'stretch' }}>
    {days.map(day => {
      const dayEvents = eventsOnDay(events, day);
      const today = isSameDay(day, new Date());
      return <Card key={day.toISOString()} component="section" sx={{ minHeight: { md: 260 }, border: '1px solid', borderColor: today ? 'primary.main' : 'divider', bgcolor: today ? 'primary.light' : 'background.paper' }}>
        <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>{dayFormatter.format(day)}</Typography>
            {canManage && <IconButton size="small" aria-label={`Termin am ${dayFormatter.format(day)} hinzufügen`} onClick={() => onCreate(day)}><AddRounded fontSize="small" /></IconButton>}
          </Stack>
          <Stack spacing={1}>
            {dayEvents.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Keine Termine</Typography>}
            {dayEvents.map(event => <EventCard key={event.id} event={event} canManage={canManage} onOpen={() => onOpen(event)} />)}
          </Stack>
        </CardContent>
      </Card>;
    })}
  </Box>;
}

function MonthView({ days, month, events, selectedDay, canManage, onSelectDay, onCreate, onOpen }: { days: Date[]; month: Date; events: CalendarEvent[]; selectedDay: Date; canManage: boolean; onSelectDay: (day: Date) => void; onCreate: (day: Date) => void; onOpen: (event: CalendarEvent) => void }) {
  const selectedEvents = eventsOnDay(events, selectedDay);

  return <Stack spacing={2}>
    <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1 }}>
      {weekdayLabels.map(label => <Typography key={label} variant="subtitle2" color="text.secondary" textAlign="center" py={0.5}>{label}</Typography>)}
      {days.map(day => {
        const dayEvents = eventsOnDay(events, day);
        const inMonth = isSameMonth(day, month);
        const today = isSameDay(day, new Date());
        return <Card key={day.toISOString()} component="section" aria-label={fullDayFormatter.format(day)} sx={{ minHeight: 156, border: '1px solid', borderColor: today ? 'primary.main' : 'divider', bgcolor: today ? 'primary.light' : inMonth ? 'background.paper' : 'action.hover', opacity: inMonth ? 1 : 0.62 }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="subtitle2" aria-current={today ? 'date' : undefined}>{day.getDate()}</Typography>
              {canManage && <IconButton size="small" aria-label={`Termin am ${dayFormatter.format(day)} hinzufügen`} onClick={() => onCreate(day)}><AddRounded fontSize="small" /></IconButton>}
            </Stack>
            <Stack spacing={0.5}>
              {dayEvents.slice(0, 3).map(event => <EventCard key={event.id} event={event} canManage={canManage} compact onOpen={() => onOpen(event)} />)}
              {dayEvents.length > 3 && <Typography variant="caption" color="text.secondary">+{dayEvents.length - 3} weitere</Typography>}
            </Stack>
          </CardContent>
        </Card>;
      })}
    </Box>

    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Card>
        <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 0.5 }}>
            {weekdayLabels.map(label => <Typography key={label} variant="caption" color="text.secondary" textAlign="center" fontWeight={700}>{label}</Typography>)}
            {days.map(day => {
              const dayEvents = eventsOnDay(events, day);
              const inMonth = isSameMonth(day, month);
              const today = isSameDay(day, new Date());
              const selected = isSameDay(day, selectedDay);
              return <ButtonBase key={day.toISOString()} aria-label={`${fullDayFormatter.format(day)}, ${dayEvents.length} ${dayEvents.length === 1 ? 'Termin' : 'Termine'}`} aria-pressed={selected} onClick={() => onSelectDay(day)} sx={{ minWidth: 0, minHeight: 54, borderRadius: 2, border: '1px solid', borderColor: selected ? 'primary.main' : 'transparent', bgcolor: selected ? 'primary.light' : 'transparent', opacity: inMonth ? 1 : 0.45, flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" fontWeight={today || selected ? 800 : 600} aria-current={today ? 'date' : undefined}>{day.getDate()}</Typography>
                <Stack direction="row" gap={0.35} minHeight={6}>
                  {dayEvents.slice(0, 3).map(event => <Box key={event.id} sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: event.calendar.color }} />)}
                </Stack>
              </ButtonBase>;
            })}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>{fullDayFormatter.format(selectedDay)}</Typography>
            {canManage && <IconButton aria-label={`Termin am ${dayFormatter.format(selectedDay)} hinzufügen`} onClick={() => onCreate(selectedDay)}><AddRounded /></IconButton>}
          </Stack>
          <Stack spacing={1}>
            {selectedEvents.length === 0 && <Typography color="text.secondary">Keine Termine an diesem Tag.</Typography>}
            {selectedEvents.map(event => <EventCard key={event.id} event={event} canManage={canManage} onOpen={() => onOpen(event)} />)}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  </Stack>;
}

function EventCard({ event, canManage, onOpen, compact = false }: { event: CalendarEvent; canManage: boolean; onOpen: () => void; compact?: boolean }) {
  const content = <Box sx={{ borderLeft: `5px solid ${event.calendar.color}`, pl: 1, py: 0.25, textAlign: 'left' }}>
    <Typography variant="subtitle2" lineHeight={1.25} noWrap={compact}>{event.title}</Typography>
    <Typography variant="caption" color="text.secondary" display="block">{event.allDay ? 'Ganztägig' : `${timeFormatter.format(new Date(event.startsAt))} – ${timeFormatter.format(new Date(event.endsAt))}`}</Typography>
    {!compact && event.location && <Stack direction="row" alignItems="center" gap={0.25} mt={0.25}><LocationOnRounded sx={{ fontSize: 14 }} color="action" /><Typography variant="caption" color="text.secondary" noWrap>{event.location}</Typography></Stack>}
    {!compact && <Chip label={event.calendar.name} size="small" sx={{ mt: 0.75, height: 22, bgcolor: `${event.calendar.color}1F` }} />}
  </Box>;
  return canManage ? <CardActionArea onClick={onOpen} sx={{ borderRadius: 2, p: 0.5, minHeight: compact ? 44 : undefined }}>{content}</CardActionArea> : content;
}

type EventForm = { calendarId: string; title: string; description: string; location: string; start: string; end: string; allDay: boolean };

function EventDialog({ event, initialDate, calendars, onClose }: { event: CalendarEvent | null; initialDate: Date; calendars: Array<{ id: string; name: string; color: string }>; onClose: () => void }) {
  const create = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const editing = event !== null;
  const initialStart = event ? new Date(event.startsAt) : new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate(), 9, 0);
  const initialEnd = event ? new Date(event.endsAt) : new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate(), 10, 0);
  const [form, setForm] = useState<EventForm>(() => ({
    calendarId: event?.calendar.id ?? calendars[0]?.id ?? '',
    title: event?.title ?? '',
    description: event?.description ?? '',
    location: event?.location ?? '',
    start: event?.allDay ? localDate(initialStart) : localDateTime(initialStart),
    end: event?.allDay ? localDate(addDays(initialEnd, -1)) : localDateTime(initialEnd),
    allDay: event?.allDay ?? false
  }));
  const [error, setError] = useState<string | null>(null);
  const pending = create.isPending || updateEvent.isPending || deleteEvent.isPending;
  const change = <K extends keyof EventForm>(key: K, value: EventForm[K]) => setForm(current => ({ ...current, [key]: value }));

  const toggleAllDay = (checked: boolean) => setForm(current => {
    const start = checked ? current.start.slice(0, 10) : `${current.start.slice(0, 10)}T09:00`;
    const end = checked ? current.end.slice(0, 10) : `${current.end.slice(0, 10)}T10:00`;
    return { ...current, allDay: checked, start, end };
  });

  const submit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setError(null);
    try {
      const startsAt = form.allDay ? parseLocalDate(form.start).toISOString() : new Date(form.start).toISOString();
      const endsAt = form.allDay ? addDays(parseLocalDate(form.end), 1).toISOString() : new Date(form.end).toISOString();
      const input: CalendarEventInput = { calendarId: form.calendarId, title: form.title, description: form.description || null, location: form.location || null, startsAt, endsAt, allDay: form.allDay };
      if (event) await updateEvent.mutateAsync({ id: event.id, input });
      else await create.mutateAsync(input);
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Der Termin konnte nicht gespeichert werden.');
    }
  };

  const remove = async () => {
    if (!event || !window.confirm(`Termin „${event.title}“ wirklich löschen?`)) return;
    setError(null);
    try {
      await deleteEvent.mutateAsync(event.id);
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Der Termin konnte nicht gelöscht werden.');
    }
  };

  return <Dialog open onClose={pending ? undefined : onClose} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>{editing ? 'Termin bearbeiten' : 'Termin hinzufügen'}</DialogTitle>
    <DialogContent><Stack spacing={2.25} pt={1}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField autoFocus required label="Titel" value={form.title} onChange={e => change('title', e.target.value)} inputProps={{ maxLength: 140 }} />
      <FormControl required><InputLabel id="event-calendar-label">Kalender</InputLabel><Select labelId="event-calendar-label" label="Kalender" value={form.calendarId} onChange={e => change('calendarId', e.target.value)}>{calendars.map(calendar => <MenuItem key={calendar.id} value={calendar.id}><Stack direction="row" alignItems="center" gap={1}><Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: calendar.color }} />{calendar.name}</Stack></MenuItem>)}</Select></FormControl>
      <FormControlLabel control={<Checkbox checked={form.allDay} onChange={e => toggleAllDay(e.target.checked)} />} label="Ganztägig" />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField required label="Beginn" type={form.allDay ? 'date' : 'datetime-local'} value={form.start} onChange={e => change('start', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField required label="Ende" type={form.allDay ? 'date' : 'datetime-local'} value={form.end} onChange={e => change('end', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText={form.allDay ? 'Letzter Tag des Termins' : undefined} />
      </Box>
      <TextField label="Ort (optional)" value={form.location} onChange={e => change('location', e.target.value)} inputProps={{ maxLength: 160 }} />
      <TextField label="Beschreibung (optional)" value={form.description} onChange={e => change('description', e.target.value)} multiline minRows={2} inputProps={{ maxLength: 2000 }} />
    </Stack></DialogContent>
    <DialogActions sx={{ p: 2.5, pt: 1.5, justifyContent: editing ? 'space-between' : 'flex-end' }}>
      {editing && <Button color="error" onClick={remove} disabled={pending}>Löschen</Button>}
      <Stack direction="row" gap={1}><Button onClick={onClose} disabled={pending}>Abbrechen</Button><Button type="submit" variant="contained" disabled={pending || calendars.length === 0}>{pending ? 'Wird gespeichert …' : 'Speichern'}</Button></Stack>
    </DialogActions>
  </Dialog>;
}
