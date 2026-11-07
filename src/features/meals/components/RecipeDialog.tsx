import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useCreateRecipe } from '../hooks/useMeals';
import type { CreateRecipeInput } from '../types/meal';
import { RecipeIngredientFields } from './RecipeIngredientFields';

const icons = ['🍽️', '🍝', '🍕', '🥗', '🍲', '🌮', '🥞', '🍛', '🥪', '🥘', '🍣', '🧁'];
const colors = ['#D6855F', '#4F8A62', '#5B7DB1', '#9B6BB1', '#CB8B33', '#C85C5C'];
const empty: CreateRecipeInput = { title: '', description: '', icon: '🍽️', color: '#D6855F', prepMinutes: '', ingredients: [{ name: '', quantity: '', category: 'OTHER' }] };

export function RecipeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateRecipe(); const [form, setForm] = useState<CreateRecipeInput>(empty); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setForm(empty); setError(null); } }, [open]);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(null); try { await create.mutateAsync({ ...form, ingredients: form.ingredients.filter(item => item.name.trim()) }); onClose(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Das Gericht konnte nicht gespeichert werden.'); } };
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>Lieblingsgericht anlegen</DialogTitle><DialogContent><Stack spacing={2.25} pt={1}>{error && <Alert severity="error">{error}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}><TextField autoFocus required label="Name des Gerichts" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} inputProps={{ maxLength: 100 }} sx={{ flex: 2 }} /><TextField type="number" label="Minuten" value={form.prepMinutes} onChange={event => setForm({ ...form, prepMinutes: event.target.value === '' ? '' : Number(event.target.value) })} inputProps={{ min: 1, max: 1440 }} sx={{ flex: 1 }} /></Stack>
      <TextField label="Beschreibung (optional)" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} multiline minRows={2} inputProps={{ maxLength: 500 }} />
      <Box><Typography fontWeight={700} mb={1}>Symbol</Typography><ToggleButtonGroup exclusive value={form.icon} onChange={(_, icon) => icon && setForm({ ...form, icon })} sx={{ display: 'flex', flexWrap: 'wrap' }}>{icons.map(icon => <ToggleButton key={icon} value={icon} sx={{ fontSize: 24, minWidth: 50 }}>{icon}</ToggleButton>)}</ToggleButtonGroup></Box>
      <Box><Typography fontWeight={700} mb={1}>Farbe</Typography><Stack direction="row" gap={1} flexWrap="wrap">{colors.map(color => <Button key={color} aria-label={`Farbe ${color}`} onClick={() => setForm({ ...form, color })} sx={{ minWidth: 48, width: 48, bgcolor: color, border: form.color === color ? '4px solid #203129' : '4px solid transparent', '&:hover': { bgcolor: color } }} />)}</Stack></Box>
      <Box><Typography variant="h6" mb={1}>Zutaten</Typography><RecipeIngredientFields value={form.ingredients} onChange={ingredients => setForm({ ...form, ingredients })} /></Box>
    </Stack></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Abbrechen</Button><Button type="submit" variant="contained" disabled={create.isPending || form.title.trim().length < 2}>Gericht speichern</Button></DialogActions>
  </Dialog>;
}
