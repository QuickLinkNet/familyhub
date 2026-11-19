import { useState, type FormEvent } from 'react';
import { Alert, Autocomplete, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import { ApiError } from '../../../services/apiClient';
import type { FamilyMember } from '../../family/types/familyMember';
import { useCreateCalendarEvent, useDeleteCalendarEvent, useUpdateCalendarEvent } from '../hooks/useCalendar';
import type { CalendarEvent, CalendarEventInput, FamilyCalendar, RecurrenceFrequency } from '../types/calendar';
import { addDays, localDate, localDateTime, parseLocalDate } from '../utils/calendarDates';

interface EventDialogProps {
  event: CalendarEvent | null;
  initialDate: Date;
  calendars: FamilyCalendar[];
  members: FamilyMember[];
  currentUserId: string | null;
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
  isPrivate: boolean;
  memberIds: string[];
  recurrenceFrequency: RecurrenceFrequency | '';
  recurrenceInterval: number;
  recurrenceUntil: string;
}

const recurrenceLabels: Record<RecurrenceFrequency | '', string> = {
  '': 'Keine Wiederholung', DAILY: 'Täglich', WEEKLY: 'Wöchentlich', MONTHLY: 'Monatlich', YEARLY: 'Jährlich'
};

function supportsLocalCalendar(calendar: FamilyCalendar | undefined) {
  return calendar?.type === 'SHARED' || calendar?.type === 'PERSONAL';
}

function suggestedMemberIds(calendar: FamilyCalendar | undefined, currentUserId: string | null): string[] {
  if (calendar?.ownerMember?.id) return [calendar.ownerMember.id];
  return currentUserId ? [currentUserId] : [];
}

export function EventDialog({ event, initialDate, calendars, members, currentUserId, onClose }: EventDialogProps) {
  const create = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const editing = event !== null;
  const initialStart = event ? new Date(event.seriesStartsAt ?? event.startsAt) : new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate(), 9, 0);
  const initialEnd = event ? new Date(event.seriesEndsAt ?? event.endsAt) : new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate(), 10, 0);
  const [form, setForm] = useState<EventForm>(() => {
    const calendarId = event?.calendar.id ?? calendars[0]?.id ?? '';
    const calendar = calendars.find(candidate => candidate.id === calendarId);
    return {
      calendarId,
      title: event?.title ?? '',
      description: event?.description ?? '',
      location: event?.location ?? '',
      start: event?.allDay ? localDate(initialStart) : localDateTime(initialStart),
      end: event?.allDay ? localDate(addDays(initialEnd, -1)) : localDateTime(initialEnd),
      allDay: event?.allDay ?? false,
      isPrivate: event?.isPrivate ?? false,
      memberIds: event ? (event.members ?? []).map(member => member.id) : suggestedMemberIds(calendar, currentUserId),
      recurrenceFrequency: event?.recurrence?.frequency ?? '',
      recurrenceInterval: event?.recurrence?.interval ?? 1,
      recurrenceUntil: event?.recurrence?.until ?? ''
    };
  });
  const [error, setError] = useState<string | null>(null);
  const pending = create.isPending || updateEvent.isPending || deleteEvent.isPending;
  const selectedCalendar = calendars.find(calendar => calendar.id === form.calendarId);
  const supportsRecurrence = supportsLocalCalendar(selectedCalendar);
  const supportsMembers = supportsLocalCalendar(selectedCalendar);
  const change = <K extends keyof EventForm>(key: K, value: EventForm[K]) => setForm(current => ({ ...current, [key]: value }));

  const changeCalendar = (calendarId: string) => {
    const calendar = calendars.find(candidate => candidate.id === calendarId);
    setForm(current => ({
      ...current,
      calendarId,
      memberIds: supportsLocalCalendar(calendar) ? suggestedMemberIds(calendar, currentUserId) : []
    }));
  };

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
        allDay: form.allDay,
        isPrivate: form.isPrivate,
        memberIds: supportsMembers ? form.memberIds : undefined,
        recurrenceFrequency: supportsRecurrence ? form.recurrenceFrequency || null : null,
        recurrenceInterval: supportsRecurrence ? form.recurrenceInterval : 1,
        recurrenceUntil: supportsRecurrence ? form.recurrenceUntil || null : null
      };
      if (event) await updateEvent.mutateAsync({ id: event.seriesId ?? event.id, input });
      else await create.mutateAsync(input);
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Der Termin konnte nicht gespeichert werden.');
    }
  };

  const remove = async () => {
    const seriesHint = event?.seriesId ? ' Die gesamte Serie wird gelöscht.' : '';
    if (!event || !window.confirm(`Termin „${event.title}“ wirklich löschen?${seriesHint}`)) return;
    setError(null);
    try {
      await deleteEvent.mutateAsync(event.seriesId ?? event.id);
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
            <Select labelId="event-calendar-label" label="Kalender" value={form.calendarId} disabled={editing} onChange={e => changeCalendar(e.target.value)}>
              {calendars.map(calendar => (
                <MenuItem key={calendar.id} value={calendar.id}>
                  <Stack direction="row" alignItems="center" gap={1}><Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: calendar.color }} />{calendar.name}</Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {supportsMembers && (
            <Autocomplete
              multiple
              options={members}
              value={members.filter(member => form.memberIds.includes(member.id))}
              getOptionLabel={member => member.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_event, selected) => change('memberIds', selected.map(member => member.id))}
              renderTags={(selected, getTagProps) => selected.map((member, index) => (
                <Chip {...getTagProps({ index })} key={member.id} avatar={<MemberAvatar name={member.name} sx={{ bgcolor: member.color }} />} label={member.name} />
              ))}
              renderOption={(props, member) => (
                <Box component="li" {...props} key={member.id} sx={{ gap: 1 }}>
                  <MemberAvatar name={member.name} sx={{ width: 30, height: 30, fontSize: 12, bgcolor: member.color }} />
                  {member.name}
                </Box>
              )}
              renderInput={params => <TextField {...params} required label="Für wen ist der Termin?" helperText="Mehrere Profile ergeben eine gemeinsame Farbcodierung." />}
            />
          )}
          {!supportsMembers && <Alert severity="info">Profile ordnet ihr lokalen FamilyHub-Terminen zu. Google-Termine verwaltet Google Kalender.</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={{ xs: 0, sm: 2 }}>
            <FormControlLabel control={<Checkbox checked={form.allDay} onChange={e => toggleAllDay(e.target.checked)} />} label="Ganztägig" />
            <FormControlLabel control={<Checkbox checked={form.isPrivate} onChange={e => change('isPrivate', e.target.checked)} />} label="Privat – Kinder sehen nur die belegte Zeit" />
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField required label="Beginn" type={form.allDay ? 'date' : 'datetime-local'} value={form.start} onChange={e => change('start', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField required label="Ende" type={form.allDay ? 'date' : 'datetime-local'} value={form.end} onChange={e => change('end', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText={form.allDay ? 'Letzter Tag des Termins' : undefined} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: form.recurrenceFrequency ? '2fr 1fr' : '1fr' }, gap: 2 }}>
            <FormControl disabled={!supportsRecurrence}>
              <InputLabel id="event-recurrence-label">Wiederholung (lokal)</InputLabel>
              <Select labelId="event-recurrence-label" label="Wiederholung (lokal)" value={form.recurrenceFrequency} onChange={e => change('recurrenceFrequency', e.target.value as RecurrenceFrequency | '')}>
                {(Object.keys(recurrenceLabels) as Array<RecurrenceFrequency | ''>).map(value => <MenuItem key={value || 'none'} value={value}>{recurrenceLabels[value]}</MenuItem>)}
              </Select>
            </FormControl>
            {form.recurrenceFrequency && <TextField label="Alle …" type="number" value={form.recurrenceInterval} onChange={e => change('recurrenceInterval', Math.max(1, Math.min(12, Number(e.target.value))))} inputProps={{ min: 1, max: 12 }} helperText="Intervall" />}
          </Box>
          {!supportsRecurrence && <Alert severity="info">Wiederholungen verwaltet ihr für Google-Termine direkt in Google Kalender.</Alert>}
          {form.recurrenceFrequency && <TextField label="Wiederholen bis (optional)" type="date" value={form.recurrenceUntil} onChange={e => change('recurrenceUntil', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText="Ohne Datum läuft die Serie unbegrenzt." />}
          <TextField label="Ort (optional)" value={form.location} onChange={e => change('location', e.target.value)} inputProps={{ maxLength: 160 }} />
          <TextField label="Beschreibung (optional)" value={form.description} onChange={e => change('description', e.target.value)} multiline minRows={2} inputProps={{ maxLength: 2000 }} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5, justifyContent: editing ? 'space-between' : 'flex-end' }}>
        {editing && <Button color="error" onClick={remove} disabled={pending}>Löschen</Button>}
        <Stack direction="row" gap={1}>
          <Button onClick={onClose} disabled={pending}>Abbrechen</Button>
          <Button type="submit" variant="contained" disabled={pending || calendars.length === 0 || (supportsMembers && form.memberIds.length === 0)}>{pending ? 'Wird gespeichert …' : 'Speichern'}</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
