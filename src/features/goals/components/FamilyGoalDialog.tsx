import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { goalColors, goalIcons } from '../constants/goalOptions';
import { useCreateFamilyGoal, useUpdateFamilyGoal } from '../hooks/useFamilyGoals';
import type { FamilyGoal, FamilyGoalInput } from '../types/familyGoal';

const blank: FamilyGoalInput = { title: '', description: '', icon: '🎯', color: '#D6855F', targetValue: 10, dueDate: '' };

export function FamilyGoalDialog({ open, goal, onClose, onDelete }: { open: boolean; goal: FamilyGoal | null; onClose: () => void; onDelete: (goal: FamilyGoal) => void }) {
  const create = useCreateFamilyGoal(); const update = useUpdateFamilyGoal(); const [form, setForm] = useState<FamilyGoalInput>(blank); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!open) return; setForm(goal ? { title: goal.title, description: goal.description ?? '', icon: goal.icon, color: goal.color, targetValue: goal.targetValue, dueDate: goal.dueDate ?? '' } : blank); setError(null); }, [open, goal]);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(null); try { if (goal) await update.mutateAsync({ id: goal.id, input: form }); else await create.mutateAsync(form); onClose(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Das Familienziel konnte nicht gespeichert werden.'); } };
  const pending = create.isPending || update.isPending;
  return <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>{goal ? 'Familienziel bearbeiten' : 'Neues Familienziel'}</DialogTitle>
    <DialogContent><Stack spacing={2.25} pt={1}>{error && <Alert severity="error">{error}</Alert>}
      <TextField autoFocus required label="Was möchten wir gemeinsam schaffen?" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} inputProps={{ maxLength: 100 }} placeholder="z. B. Zehn Fahrradausflüge" />
      <TextField label="Warum ist uns das wichtig? (optional)" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} multiline minRows={2} inputProps={{ maxLength: 500 }} />
      <Box><Typography fontWeight={800} mb={1}>Symbol</Typography><Stack direction="row" gap={0.75} flexWrap="wrap">{goalIcons.map(icon => <Button type="button" key={icon} aria-label={`Symbol ${icon}`} variant={form.icon === icon ? 'contained' : 'outlined'} onClick={() => setForm({ ...form, icon })} sx={{ minWidth: 48, px: 1, fontSize: 22 }}>{icon}</Button>)}</Stack></Box>
      <Box><Typography fontWeight={800} mb={1}>Farbe</Typography><Stack direction="row" gap={1}>{goalColors.map(color => <Box component="button" type="button" aria-label={`Farbe ${color}`} key={color} onClick={() => setForm({ ...form, color })} sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: color, border: form.color === color ? '4px solid #203129' : '3px solid white', boxShadow: `0 0 0 1px ${color}`, cursor: 'pointer' }} />)}</Stack></Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField required type="number" label="Benötigte Schritte" value={form.targetValue} onChange={event => setForm({ ...form, targetValue: Number(event.target.value) })} inputProps={{ min: Math.max(2, goal?.currentValue ?? 2), max: 100 }} /><TextField type="date" label="Wunschtermin (optional)" value={form.dueDate} onChange={event => setForm({ ...form, dueDate: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} /></Stack>
    </Stack></DialogContent>
    <DialogActions sx={{ p: 2.5 }}>{goal && <Button color="error" onClick={() => onDelete(goal)} disabled={pending} sx={{ mr: 'auto' }}>Löschen</Button>}<Button onClick={onClose} disabled={pending}>Abbrechen</Button><Button type="submit" variant="contained" disabled={pending || form.title.trim().length < 2 || form.targetValue < Math.max(2, goal?.currentValue ?? 2)}>{pending ? 'Speichert …' : 'Ziel speichern'}</Button></DialogActions>
  </Dialog>;
}
