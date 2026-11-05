import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useCreateCalendarEvent, useDeleteCalendarEvent, useUpdateCalendarEvent } from '../hooks/useCalendar';
import type { CalendarEvent, CalendarEventInput, FamilyCalendar } from '../types/calendar';
import { addDays, localDate, localDateTime, parseLocalDate } from '../utils/calendarDates';

interface EventDialogProps {
  event: CalendarEvent | null;
  initialDate: Date;
  calendars: FamilyCalendar[];
  onClose: () => void;
}

interface EventForm {
  calendarId: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  allDay: boolean;
}

export function EventDialog({ event, initialDate, calendars, onClose }: EventDialogProps) {
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

  const toggleAllDay = (checked: boolean) => setForm(current => ({
    ...current,
    allDay: checked,
    start: checked ? current.start.slice(0, 10) : `${current.start.slice(0, 10)}T09:00`,
    end: checked ? current.end.slice(0, 10) : `${current.end.slice(0, 10)}T10:00`
  }));

  const submit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setError(null);
    try {
      const input: CalendarEventInput = {
        calendarId: form.calendarId,
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        startsAt: form.allDay ? parseLocalDate(form.start).toISOString() : new Date(form.start).toISOString(),
        endsAt: form.allDay ? addDays(parseLocalDate(form.end), 1).toISOString() : new Date(form.end).toISOString(),
        allDay: form.allDay
      };
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

  return (
    <Dialog open onClose={pending ? undefined : onClose} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: submit }}>
      <DialogTitle>{editing ? 'Termin bearbeiten' : 'Termin hinzufügen'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} pt={1}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField autoFocus required label="Titel" value={form.title} onChange={e => change('title', e.target.value)} inputProps={{ maxLength: 140 }} />
          <FormControl required>
            <InputLabel id="event-calendar-label">Kalender</InputLabel>
            <Select labelId="event-calendar-label" label="Kalender" value={form.calendarId} onChange={e => change('calendarId', e.target.value)}>
              {calendars.map(calendar => (
                <MenuItem key={calendar.id} value={calendar.id}>
                  <Stack direction="row" alignItems="center" gap={1}><Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: calendar.color }} />{calendar.name}</Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel control={<Checkbox checked={form.allDay} onChange={e => toggleAllDay(e.target.checked)} />} label="Ganztägig" />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField required label="Beginn" type={form.allDay ? 'date' : 'datetime-local'} value={form.start} onChange={e => change('start', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField required label="Ende" type={form.allDay ? 'date' : 'datetime-local'} value={form.end} onChange={e => change('end', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText={form.allDay ? 'Letzter Tag des Termins' : undefined} />
          </Box>
          <TextField label="Ort (optional)" value={form.location} onChange={e => change('location', e.target.value)} inputProps={{ maxLength: 160 }} />
          <TextField label="Beschreibung (optional)" value={form.description} onChange={e => change('description', e.target.value)} multiline minRows={2} inputProps={{ maxLength: 2000 }} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5, justifyContent: editing ? 'space-between' : 'flex-end' }}>
        {editing && <Button color="error" onClick={remove} disabled={pending}>Löschen</Button>}
        <Stack direction="row" gap={1}>
          <Button onClick={onClose} disabled={pending}>Abbrechen</Button>
          <Button type="submit" variant="contained" disabled={pending || calendars.length === 0}>{pending ? 'Wird gespeichert …' : 'Speichern'}</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
