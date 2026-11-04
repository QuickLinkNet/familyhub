import { useMemo, useState, type FormEvent } from 'react';
import { AddRounded, ChevronLeftRounded, ChevronRightRounded, EventAvailableRounded, LocationOnRounded } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardActionArea, CardContent, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { useCalendarEvents, useCalendars, useCreateCalendarEvent, useDeleteCalendarEvent, useUpdateCalendarEvent } from '../hooks/useCalendar';
import type { CalendarEvent, CalendarEventInput } from '../types/calendar';

const dayFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
const monthFormatter = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const startOfWeek = (date: Date) => addDays(startOfDay(date), -((date.getDay() + 6) % 7));
const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const localDateTime = (date: Date) => `${localDate(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};
const isSameDay = (a: Date, b: Date) => localDate(a) === localDate(b);

export function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [createDate, setCreateDate] = useState<Date | null>(null);
  const weekEnd = addDays(weekStart, 7);
  const events = useCalendarEvents(weekStart.toISOString(), weekEnd.toISOString());
  const calendars = useCalendars();
  const session = useAuthSession();
  const canManage = session.data?.user?.role !== 'CHILD';
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);

  const openCreate = (day = new Date()) => {
    setSelectedEvent(null);
    setCreateDate(day);
  };
  const closeDialog = () => {
    setSelectedEvent(null);
    setCreateDate(null);
  };

  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
      <Box><Typography variant="h3" sx={{ fontSize: { xs: '2.15rem', md: '3.1rem' } }}>Familienkalender</Typography><Typography color="text.secondary" mt={0.5}>Alle Termine und persönlichen Kalender in einer Woche.</Typography></Box>
      {canManage && <Button variant="contained" startIcon={<AddRounded />} onClick={() => openCreate()}>Termin hinzufügen</Button>}
    </Stack>

    <Card>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5}>
          <Stack direction="row" alignItems="center" justifyContent={{ xs: 'space-between', sm: 'flex-start' }} gap={0.5}>
            <IconButton aria-label="Vorherige Woche" onClick={() => setWeekStart(current => addDays(current, -7))}><ChevronLeftRounded /></IconButton>
            <Typography variant="h6" sx={{ minWidth: { sm: 260 }, textAlign: 'center' }}>{monthFormatter.format(weekStart)} – {monthFormatter.format(addDays(weekEnd, -1))}</Typography>
            <IconButton aria-label="Nächste Woche" onClick={() => setWeekStart(current => addDays(current, 7))}><ChevronRightRounded /></IconButton>
          </Stack>
          <Button variant="outlined" onClick={() => setWeekStart(startOfWeek(new Date()))}>Heute</Button>
        </Stack>
      </CardContent>
    </Card>

    {events.isError && <Alert severity="error">{events.error instanceof ApiError ? events.error.message : 'Die Termine konnten nicht geladen werden.'}</Alert>}
    {calendars.isError && <Alert severity="error">{calendars.error instanceof ApiError ? calendars.error.message : 'Die Kalender konnten nicht geladen werden.'}</Alert>}

    {events.isLoading
      ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(7, minmax(0, 1fr))' }, gap: 1.5 }}>{days.map(day => <Skeleton key={day.toISOString()} variant="rounded" height={220} />)}</Box>
      : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(7, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'stretch' }}>
          {days.map(day => {
            const dayEnd = addDays(day, 1);
            const dayEvents = (events.data ?? []).filter(event => new Date(event.startsAt) < dayEnd && new Date(event.endsAt) > day);
            const today = isSameDay(day, new Date());
            return <Card key={day.toISOString()} component="section" sx={{ minHeight: { md: 260 }, border: '1px solid', borderColor: today ? 'primary.main' : 'divider', bgcolor: today ? 'primary.light' : 'background.paper' }}>
              <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>{dayFormatter.format(day)}</Typography>
                  {canManage && <IconButton size="small" aria-label={`Termin am ${dayFormatter.format(day)} hinzufügen`} onClick={() => openCreate(day)}><AddRounded fontSize="small" /></IconButton>}
                </Stack>
                <Stack spacing={1}>
                  {dayEvents.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Keine Termine</Typography>}
                  {dayEvents.map(event => <EventCard key={event.id} event={event} canManage={canManage} onOpen={() => { setCreateDate(null); setSelectedEvent(event); }} />)}
                </Stack>
              </CardContent>
            </Card>;
          })}
        </Box>}

    {!events.isLoading && events.data?.length === 0 && <Card><CardContent sx={{ py: 5, textAlign: 'center' }}><EventAvailableRounded color="primary" sx={{ fontSize: 52 }} /><Typography variant="h5" mt={1}>Diese Woche ist noch frei</Typography><Typography color="text.secondary" mt={0.5}>{canManage ? 'Tragt euren ersten gemeinsamen oder persönlichen Termin ein.' : 'Für diese Woche sind keine Termine eingetragen.'}</Typography></CardContent></Card>}

    {(createDate !== null || selectedEvent !== null) && canManage && <EventDialog event={selectedEvent} initialDate={createDate ?? new Date()} calendars={calendars.data ?? []} onClose={closeDialog} />}
  </Stack>;
}

function EventCard({ event, canManage, onOpen }: { event: CalendarEvent; canManage: boolean; onOpen: () => void }) {
  const content = <Box sx={{ borderLeft: `5px solid ${event.calendar.color}`, pl: 1, py: 0.25, textAlign: 'left' }}>
    <Typography variant="subtitle2" lineHeight={1.25}>{event.title}</Typography>
    <Typography variant="caption" color="text.secondary" display="block">{event.allDay ? 'Ganztägig' : `${timeFormatter.format(new Date(event.startsAt))} – ${timeFormatter.format(new Date(event.endsAt))}`}</Typography>
    {event.location && <Stack direction="row" alignItems="center" gap={0.25} mt={0.25}><LocationOnRounded sx={{ fontSize: 14 }} color="action" /><Typography variant="caption" color="text.secondary" noWrap>{event.location}</Typography></Stack>}
    <Chip label={event.calendar.name} size="small" sx={{ mt: 0.75, height: 22, bgcolor: `${event.calendar.color}1F` }} />
  </Box>;
  return canManage ? <CardActionArea onClick={onOpen} sx={{ borderRadius: 2, p: 0.5 }}>{content}</CardActionArea> : content;
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
