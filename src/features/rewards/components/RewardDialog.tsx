import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useCreateReward } from '../hooks/useRewards';
import type { CreateRewardInput } from '../types/reward';

const icons = ['🎁', '🍦', '🎬', '🎮', '🍕', '🎡', '📚', '⭐', '🏆', '🎨', '⚽', '🧸'];
const colors = ['#D6855F', '#4F8A62', '#5B7DB1', '#9B6BB1', '#CB8B33', '#C85C5C'];
const empty: CreateRewardInput = { title: '', description: '', costPoints: 20, icon: '🎁', color: '#D6855F' };

export function RewardDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateReward();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setForm(empty); setError(null); } }, [open]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(null);
    try { await create.mutateAsync(form); onClose(); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Die Belohnung konnte nicht gespeichert werden.'); }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: submit }}>
      <DialogTitle>Neue Belohnung</DialogTitle>
      <DialogContent><Stack spacing={2.25} pt={1}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField autoFocus required label="Worauf freut ihr euch?" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} inputProps={{ maxLength: 80 }} />
        <TextField label="Beschreibung (optional)" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} multiline minRows={2} inputProps={{ maxLength: 500 }} />
        <TextField required type="number" label="Benötigte Sterne" value={form.costPoints} onChange={event => setForm({ ...form, costPoints: Number(event.target.value) })} inputProps={{ min: 1, max: 10000 }} />
        <Box><Box component="span" sx={{ display: 'block', fontWeight: 700, mb: 1 }}>Symbol</Box><ToggleButtonGroup exclusive value={form.icon} onChange={(_, value) => value && setForm({ ...form, icon: value })} sx={{ display: 'flex', flexWrap: 'wrap' }}>{icons.map(icon => <ToggleButton key={icon} value={icon} sx={{ fontSize: 24, minWidth: 52 }}>{icon}</ToggleButton>)}</ToggleButtonGroup></Box>
        <Box><Box component="span" sx={{ display: 'block', fontWeight: 700, mb: 1 }}>Farbe</Box><Stack direction="row" gap={1} flexWrap="wrap">{colors.map(color => <Button key={color} aria-label={`Farbe ${color}`} onClick={() => setForm({ ...form, color })} sx={{ minWidth: 50, width: 50, bgcolor: color, border: form.color === color ? '4px solid #203129' : '4px solid transparent', '&:hover': { bgcolor: color } }} />)}</Stack></Box>
      </Stack></DialogContent>
      <DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Abbrechen</Button><Button type="submit" variant="contained" disabled={create.isPending || form.title.trim().length < 2 || form.costPoints < 1}>{create.isPending ? 'Wird gespeichert …' : 'Belohnung anlegen'}</Button></DialogActions>
    </Dialog>
  );
}
