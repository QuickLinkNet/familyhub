import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import type { FamilyMember } from '../../family/types/familyMember';
import { useCreateSchoolItem, useUpdateSchoolItem } from '../hooks/useSchool';
import type { SchoolItem, SchoolItemInput, SchoolItemType } from '../types/school';
import { localDate } from '../utils/schoolDates';

const blank = (memberId: string, type: SchoolItemType): SchoolItemInput => ({ memberId, itemType: type, subject: '', title: '', description: '', dueDate: localDate(new Date()) });

export function SchoolItemDialog({ open, item, type, members, memberId, ownMemberOnly, onClose, onDelete }: { open: boolean; item: SchoolItem | null; type: SchoolItemType; members: FamilyMember[]; memberId: string; ownMemberOnly: boolean; onClose: () => void; onDelete: (item: SchoolItem) => void }) {
  const create = useCreateSchoolItem(); const update = useUpdateSchoolItem(); const [form, setForm] = useState<SchoolItemInput>(blank(memberId, type)); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!open) return; setForm(item ? { memberId: item.member.id, itemType: item.itemType, subject: item.subject, title: item.title, description: item.description ?? '', dueDate: item.dueDate } : blank(memberId || members[0]?.id || '', type)); setError(null); }, [open, item, type, memberId, members]);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(null); try { if (item) await update.mutateAsync({ id: item.id, input: form }); else await create.mutateAsync(form); onClose(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Der Schuleintrag konnte nicht gespeichert werden.'); } };
  const pending = create.isPending || update.isPending;
  return <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: submit }}><DialogTitle>{item ? 'Schuleintrag bearbeiten' : form.itemType === 'TEST' ? 'Test eintragen' : 'Hausaufgabe eintragen'}</DialogTitle><DialogContent><Stack spacing={2.25} pt={1}>
    {error && <Alert severity="error">{error}</Alert>}
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField select required disabled={ownMemberOnly} label="Für wen?" value={form.memberId} onChange={event => setForm({ ...form, memberId: event.target.value })} fullWidth>{members.map(member => <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>)}</TextField><TextField select label="Art" value={form.itemType} onChange={event => setForm({ ...form, itemType: event.target.value as SchoolItemType })} fullWidth><MenuItem value="HOMEWORK">📚 Hausaufgabe</MenuItem><MenuItem value="TEST">📝 Test / Arbeit</MenuItem></TextField></Stack>
    <TextField required autoFocus label="Fach" value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} inputProps={{ maxLength: 60 }} />
    <TextField required label={form.itemType === 'TEST' ? 'Thema des Tests' : 'Was ist auf?'} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} inputProps={{ maxLength: 140 }} />
    <TextField label="Notiz (optional)" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} multiline minRows={2} inputProps={{ maxLength: 1000 }} />
    <TextField required type="date" label={form.itemType === 'TEST' ? 'Termin' : 'Fällig am'} value={form.dueDate} onChange={event => setForm({ ...form, dueDate: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
  </Stack></DialogContent><DialogActions sx={{ p: 2.5 }}>{item && <Button color="error" onClick={() => onDelete(item)} disabled={pending} sx={{ mr: 'auto' }}>Löschen</Button>}<Button onClick={onClose} disabled={pending}>Abbrechen</Button><Button variant="contained" type="submit" disabled={pending || !form.memberId || form.subject.trim().length < 2 || form.title.trim().length < 2}>{pending ? 'Speichert …' : 'Eintrag speichern'}</Button></DialogActions></Dialog>;
}
