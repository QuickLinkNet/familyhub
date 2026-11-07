import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { noteColors, noteIcons } from '../constants/noteOptions';
import { useCreateFamilyNote, useUpdateFamilyNote } from '../hooks/useFamilyNotes';
import type { FamilyNote, FamilyNoteInput } from '../types/familyNote';

const emptyNote: FamilyNoteInput = { title: '', body: '', icon: '📌', color: '#D6855F', isImportant: false, expiresOn: null };

export function FamilyNoteDialog({ open, note, onClose }: { open: boolean; note: FamilyNote | null; onClose: () => void }) {
  const create = useCreateFamilyNote();
  const update = useUpdateFamilyNote();
  const [form, setForm] = useState<FamilyNoteInput>(emptyNote);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setForm(note ? { title: note.title, body: note.body, icon: note.icon, color: note.color, isImportant: note.isImportant, expiresOn: note.expiresOn } : emptyNote);
    setError(null);
  }, [open, note]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(null);
    try {
      if (note) await update.mutateAsync({ id: note.id, note: form });
      else await create.mutateAsync(form);
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Der Pinnwand-Zettel konnte nicht gespeichert werden.');
    }
  };
  const pending = create.isPending || update.isPending;
  return <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>{note ? 'Pinnwand-Zettel bearbeiten' : 'Neuen Zettel anpinnen'}</DialogTitle>
    <DialogContent><Stack spacing={2.25} pt={1}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField autoFocus required label="Kurzer Titel" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} inputProps={{ maxLength: 80 }} />
      <TextField required label="Nachricht" value={form.body} onChange={event => setForm({ ...form, body: event.target.value })} multiline minRows={3} inputProps={{ maxLength: 800 }} helperText={`${form.body.length}/800 Zeichen`} />
      <FormControlLabel control={<Switch checked={form.isImportant} onChange={event => setForm({ ...form, isImportant: event.target.checked })} />} label="Wichtig – oben an der Pinnwand zeigen" />
      <TextField type="date" label="Sichtbar bis (optional)" value={form.expiresOn ?? ''} onChange={event => setForm({ ...form, expiresOn: event.target.value || null })} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().slice(0, 10) }} helperText="Danach verschwindet der Zettel automatisch." />
      <Box><Typography fontWeight={700} mb={1}>Symbol</Typography><ToggleButtonGroup exclusive value={form.icon} onChange={(_, value) => value && setForm({ ...form, icon: value })} sx={{ display: 'flex', flexWrap: 'wrap' }}>{noteIcons.map(icon => <ToggleButton key={icon} value={icon} sx={{ fontSize: 24, minWidth: 52 }}>{icon}</ToggleButton>)}</ToggleButtonGroup></Box>
      <Box><Typography fontWeight={700} mb={1}>Farbe</Typography><Stack direction="row" gap={1} flexWrap="wrap">{noteColors.map(color => <Button key={color} aria-label={`Farbe ${color}`} onClick={() => setForm({ ...form, color })} sx={{ minWidth: 50, width: 50, bgcolor: color, border: form.color === color ? '4px solid #203129' : '4px solid transparent', '&:hover': { bgcolor: color } }} />)}</Stack></Box>
    </Stack></DialogContent>
    <DialogActions sx={{ p: 2.5 }}><Button onClick={onClose} disabled={pending}>Abbrechen</Button><Button type="submit" variant="contained" disabled={pending || form.title.trim().length < 2 || form.body.trim().length < 2}>{pending ? 'Wird angepinnt …' : note ? 'Änderungen speichern' : 'Zettel anpinnen'}</Button></DialogActions>
  </Dialog>;
}
