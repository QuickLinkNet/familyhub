import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Radio, RadioGroup, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { listColors, listIcons, visibilityOptions } from '../constants/listOptions';
import { useCreateFamilyList, useUpdateFamilyList } from '../hooks/useFamilyLists';
import type { FamilyList, FamilyListInput, ListVisibility } from '../types/familyList';

interface Props { open: boolean; list?: FamilyList; onClose: () => void }

export function FamilyListDialog({ open, list, onClose }: Props) {
  const create = useCreateFamilyList(); const update = useUpdateFamilyList(); const session = useAuthSession();
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(listIcons[0]); const [color, setColor] = useState(listColors[0]);
  const [visibility, setVisibility] = useState<ListVisibility>('FAMILY'); const [error, setError] = useState<string | null>(null);
  const isAdult = session.data?.user?.role === 'ADMIN' || session.data?.user?.role === 'PARENT';
  useEffect(() => {
    if (!open) return;
    setName(list?.name ?? ''); setDescription(list?.description ?? ''); setIcon(list?.icon ?? listIcons[0]);
    setColor(list?.color ?? listColors[0]); setVisibility(list?.visibility ?? 'FAMILY'); setError(null);
  }, [list, open]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(null);
    const input: FamilyListInput = { name, description, icon, color, visibility };
    try { if (list) await update.mutateAsync({ id: list.id, list: input }); else await create.mutateAsync(input); onClose(); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Die Liste konnte nicht gespeichert werden.'); }
  };
  const pending = create.isPending || update.isPending;
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>{list ? 'Liste bearbeiten' : 'Neue Liste'}</DialogTitle>
    <DialogContent><Stack spacing={2} pt={1}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField autoFocus required label="Name" value={name} onChange={event => setName(event.target.value)} inputProps={{ maxLength: 70 }} placeholder="z. B. Urlaubspackliste" />
      <TextField multiline minRows={1} label="Beschreibung (optional)" value={description} onChange={event => setDescription(event.target.value)} inputProps={{ maxLength: 240 }} />
      <Box><Typography fontWeight={700} mb={1}>Symbol</Typography><ToggleButtonGroup exclusive value={icon} onChange={(_, value) => value && setIcon(value)} sx={{ display: 'flex', flexWrap: 'wrap' }}>{listIcons.map(value => <ToggleButton key={value} value={value} sx={{ fontSize: 24, minWidth: 48 }}>{value}</ToggleButton>)}</ToggleButtonGroup></Box>
      <Box><Typography fontWeight={700} mb={1}>Farbe</Typography><Stack direction="row" gap={1} flexWrap="wrap">{listColors.map(value => <Button key={value} aria-label={`Farbe ${value}`} onClick={() => setColor(value)} sx={{ minWidth: 48, width: 48, bgcolor: value, border: '4px solid', borderColor: color === value ? 'text.primary' : 'transparent', '&:hover': { bgcolor: value } }} />)}</Stack></Box>
      <FormControl><Typography fontWeight={700} mb={1}>Sichtbarkeit</Typography><RadioGroup value={visibility} onChange={event => setVisibility(event.target.value as ListVisibility)} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>{visibilityOptions.map(option => { const Icon = option.icon; const disabled = option.value === 'ADULTS' && !isAdult; return <FormControlLabel key={option.value} value={option.value} disabled={disabled} control={<Radio />} sx={{ m: 0, p: 1, alignItems: 'flex-start', border: 1, borderColor: visibility === option.value ? 'primary.main' : 'divider', borderRadius: 2 }} label={<Stack gap={0.25}><Stack direction="row" alignItems="center" gap={0.75}><Icon color="action" fontSize="small" /><Typography fontWeight={700}>{option.label}</Typography></Stack><Typography variant="caption" color="text.secondary">{option.description}</Typography></Stack>} />; })}</RadioGroup></FormControl>
    </Stack></DialogContent>
    <DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Abbrechen</Button><Button type="submit" variant="contained" disabled={pending || name.trim().length < 2}>{list ? 'Speichern' : 'Liste anlegen'}</Button></DialogActions>
  </Dialog>;
}
