import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useCreateShoppingList } from '../hooks/useShopping';

const icons = ['🛒', '🛍️', '🥕', '🏠', '🎉', '🧺'];
const colors = ['#345B48', '#D6855F', '#5B7DB1', '#9B6BB1', '#CB8B33', '#C85C5C'];

export function ShoppingListDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateShoppingList(); const [name, setName] = useState(''); const [icon, setIcon] = useState('🛒'); const [color, setColor] = useState('#345B48'); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setName(''); setIcon('🛒'); setColor('#345B48'); setError(null); } }, [open]);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(null); try { await create.mutateAsync({ name, icon, color }); onClose(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Die Liste konnte nicht angelegt werden.'); } };
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>Neue Einkaufsliste</DialogTitle><DialogContent><Stack spacing={2.25} pt={1}>{error && <Alert severity="error">{error}</Alert>}
      <TextField autoFocus required label="Name der Liste" value={name} onChange={event => setName(event.target.value)} inputProps={{ maxLength: 60 }} placeholder="z. B. Wocheneinkauf" />
      <Box><Box component="span" sx={{ display: 'block', fontWeight: 700, mb: 1 }}>Symbol</Box><ToggleButtonGroup exclusive value={icon} onChange={(_, value) => value && setIcon(value)} sx={{ display: 'flex', flexWrap: 'wrap' }}>{icons.map(value => <ToggleButton key={value} value={value} sx={{ fontSize: 24, minWidth: 48 }}>{value}</ToggleButton>)}</ToggleButtonGroup></Box>
      <Box><Box component="span" sx={{ display: 'block', fontWeight: 700, mb: 1 }}>Farbe</Box><Stack direction="row" gap={1} flexWrap="wrap">{colors.map(value => <Button key={value} aria-label={`Farbe ${value}`} onClick={() => setColor(value)} sx={{ minWidth: 48, width: 48, bgcolor: value, border: color === value ? '4px solid #203129' : '4px solid transparent', '&:hover': { bgcolor: value } }} />)}</Stack></Box>
    </Stack></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Abbrechen</Button><Button type="submit" variant="contained" disabled={create.isPending || name.trim().length < 2}>Liste anlegen</Button></DialogActions>
  </Dialog>;
}
