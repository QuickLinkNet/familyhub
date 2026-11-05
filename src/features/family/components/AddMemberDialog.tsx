import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { memberColors } from '../../../theme/memberPalette';
import { familyRoleLabels } from '../constants/familyOptions';
import { useCreateFamilyMember } from '../hooks/useFamilyMembers';
import type { CreateFamilyMemberInput, FamilyRole } from '../types/familyMember';

const emptyMember: CreateFamilyMemberInput = { name: '', role: 'CHILD', color: memberColors[0], pin: '' };

export function AddMemberDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMember = useCreateFamilyMember();
  const [form, setForm] = useState<CreateFamilyMemberInput>(emptyMember);
  const [error, setError] = useState<string | null>(null);
  const update = <K extends keyof CreateFamilyMemberInput>(key: K, value: CreateFamilyMemberInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const close = () => {
    if (!createMember.isPending) {
      setError(null);
      onClose();
    }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await createMember.mutateAsync(form);
      setForm(emptyMember);
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Das Familienmitglied konnte nicht gespeichert werden.');
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="xs" PaperProps={{ component: 'form', onSubmit: submit }}>
      <DialogTitle>Familienmitglied hinzufügen</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} pt={1}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField autoFocus required label="Name" value={form.name} onChange={event => update('name', event.target.value)} inputProps={{ maxLength: 80 }} fullWidth />
          <FormControl fullWidth>
            <InputLabel id="family-role-label">Rolle</InputLabel>
            <Select labelId="family-role-label" label="Rolle" value={form.role} onChange={event => update('role', event.target.value as FamilyRole)}>
              {(Object.keys(familyRoleLabels) as FamilyRole[]).map(role => <MenuItem key={role} value={role}>{familyRoleLabels[role]}</MenuItem>)}
            </Select>
          </FormControl>
          {form.role === 'CHILD'
            ? <TextField label="PIN (optional)" type="password" value={form.pin ?? ''} onChange={event => update('pin', event.target.value)} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 8 }} helperText="4 bis 8 Ziffern für den Kinderzugang." fullWidth />
            : <TextField required label="Passwort" type="password" autoComplete="new-password" value={form.password ?? ''} onChange={event => update('password', event.target.value)} inputProps={{ maxLength: 128 }} helperText="Mindestens 8 Zeichen für den Erwachsenenzugang." fullWidth />}
          <Box>
            <Typography variant="subtitle2" mb={1}>Farbe</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {memberColors.map(color => <Button key={color} aria-label={`Farbe ${color}`} onClick={() => update('color', color)} variant={form.color === color ? 'contained' : 'outlined'} sx={{ minWidth: 48, width: 48, p: 0, borderColor: color, bgcolor: form.color === color ? color : 'transparent', '&:hover': { bgcolor: color, borderColor: color } }} />)}
            </Stack>
            <FormHelperText>Diese Farbe erscheint bei Aufgaben und Terminen.</FormHelperText>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={close}>Abbrechen</Button>
        <Button type="submit" variant="contained" disabled={createMember.isPending}>{createMember.isPending ? 'Wird gespeichert …' : 'Hinzufügen'}</Button>
      </DialogActions>
    </Dialog>
  );
}
