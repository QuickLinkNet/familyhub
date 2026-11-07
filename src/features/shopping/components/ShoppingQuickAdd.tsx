import { AddRounded, PriorityHighRounded } from '@mui/icons-material';
import { Alert, Button, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Stack, TextField, Tooltip } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { ApiError } from '../../../services/apiClient';
import { categoryMeta, shoppingCategories } from '../constants/categories';
import { useAddShoppingItem } from '../hooks/useShopping';
import type { ShoppingCategory } from '../types/shopping';

export function ShoppingQuickAdd({ listId, color }: { listId: string; color: string }) {
  const add = useAddShoppingItem(); const [name, setName] = useState(''); const [quantity, setQuantity] = useState(''); const [category, setCategory] = useState<ShoppingCategory>('OTHER'); const [urgent, setUrgent] = useState(false); const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(null); try { await add.mutateAsync({ listId, item: { name, quantity, category, note: '', isUrgent: urgent } }); setName(''); setQuantity(''); setUrgent(false); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Der Artikel konnte nicht hinzugefügt werden.'); } };
  return <Paper component="form" onSubmit={submit} sx={{ p: { xs: 1.5, sm: 2 }, borderTop: `5px solid ${color}` }}>
    <Stack direction={{ xs: 'column', md: 'row' }} gap={1.25} alignItems={{ md: 'center' }}>
      <TextField autoFocus label="Was fehlt?" value={name} onChange={event => setName(event.target.value)} inputProps={{ maxLength: 100 }} sx={{ flex: 2 }} />
      <TextField label="Menge" value={quantity} onChange={event => setQuantity(event.target.value)} inputProps={{ maxLength: 30 }} placeholder="2 Packungen" sx={{ flex: 1 }} />
      <FormControl sx={{ flex: 1, minWidth: 150 }}><InputLabel id="shopping-category-label">Bereich</InputLabel><Select labelId="shopping-category-label" label="Bereich" value={category} onChange={event => setCategory(event.target.value as ShoppingCategory)}>{shoppingCategories.map(value => <MenuItem key={value} value={value}>{categoryMeta[value].icon} {categoryMeta[value].label}</MenuItem>)}</Select></FormControl>
      <Tooltip title={urgent ? 'Dringend markiert' : 'Als dringend markieren'}><IconButton aria-label={urgent ? 'Dringlichkeit entfernen' : 'Als dringend markieren'} color={urgent ? 'error' : 'default'} onClick={() => setUrgent(value => !value)}><PriorityHighRounded /></IconButton></Tooltip>
      <Button type="submit" variant="contained" startIcon={<AddRounded />} disabled={add.isPending || !name.trim()}>Hinzufügen</Button>
    </Stack>{error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
  </Paper>;
}
