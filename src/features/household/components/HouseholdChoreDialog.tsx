import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import type { FamilyMember } from '../../family/types/familyMember';
import { householdCategories, householdRecurrences } from '../constants/householdOptions';
import { useCreateHouseholdChore, useUpdateHouseholdChore } from '../hooks/useHousehold';
import type { HouseholdChore, HouseholdChoreInput, HouseholdCategory, HouseholdRecurrence } from '../types/household';
import { localDate } from '../utils/householdDates';

const blank = (memberId: string): HouseholdChoreInput => ({ title: '', description: '', category: 'CLEANING', assignedMemberId: memberId, recurrence: 'WEEKLY', nextDueDate: localDate(new Date()) });

export function HouseholdChoreDialog({ open, chore, members, defaultMemberId, onClose, onDelete }: { open: boolean; chore: HouseholdChore | null; members: FamilyMember[]; defaultMemberId: string; onClose: () => void; onDelete: (chore: HouseholdChore) => void }) {
  const create = useCreateHouseholdChore(); const update = useUpdateHouseholdChore(); const [form, setForm] = useState<HouseholdChoreInput>(blank(defaultMemberId)); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!open) return; setForm(chore ? { title: chore.title, description: chore.description ?? '', category: chore.category, assignedMemberId: chore.assignedMember.id, recurrence: chore.recurrence, nextDueDate: chore.nextDueDate } : blank(defaultMemberId || members[0]?.id || '')); setError(null); }, [open, chore, defaultMemberId, members]);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(null); try { if (chore) await update.mutateAsync({ id: chore.id, input: form }); else await create.mutateAsync(form); onClose(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Die Haushaltsaufgabe konnte nicht gespeichert werden.'); } };
  const pending = create.isPending || update.isPending;
  return <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>{chore ? 'Haushaltsaufgabe bearbeiten' : 'Neue Haushaltsaufgabe'}</DialogTitle><DialogContent><Stack spacing={2.25} pt={1}>{error && <Alert severity="error">{error}</Alert>}
      <TextField autoFocus required label="Was ist zu tun?" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} inputProps={{ maxLength: 120 }} placeholder="z. B. Biomüll rausbringen" />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField select label="Bereich" value={form.category} onChange={event => setForm({ ...form, category: event.target.value as HouseholdCategory })} fullWidth>{householdCategories.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField><TextField select required label="Wer ist dran?" value={form.assignedMemberId} onChange={event => setForm({ ...form, assignedMemberId: event.target.value })} fullWidth>{members.map(member => <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>)}</TextField></Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField select label="Wiederholung" value={form.recurrence} onChange={event => setForm({ ...form, recurrence: event.target.value as HouseholdRecurrence })} fullWidth>{householdRecurrences.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField><TextField required type="date" label="Nächste Fälligkeit" value={form.nextDueDate} onChange={event => setForm({ ...form, nextDueDate: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} fullWidth /></Stack>
      <TextField label="Hinweis (optional)" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} multiline minRows={2} inputProps={{ maxLength: 600 }} placeholder="Was sollte dabei beachtet werden?" />
    </Stack></DialogContent><DialogActions sx={{ p: 2.5 }}>{chore && <Button color="error" onClick={() => onDelete(chore)} disabled={pending} sx={{ mr: 'auto' }}>Löschen</Button>}<Button onClick={onClose} disabled={pending}>Abbrechen</Button><Button variant="contained" type="submit" disabled={pending || form.title.trim().length < 2 || !form.assignedMemberId}>{pending ? 'Speichert …' : 'Aufgabe speichern'}</Button></DialogActions>
  </Dialog>;
}
