import { useState, type FormEvent } from 'react';
import { AddRounded, PersonAddAlt1Rounded } from '@mui/icons-material';
import { Alert, Avatar, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputLabel, MenuItem, Select, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { useCreateFamilyMember, useFamilyMembers } from '../hooks/useFamilyMembers';
import type { CreateFamilyMemberInput, FamilyRole } from '../types/familyMember';

const roleLabels: Record<FamilyRole, string> = { ADMIN: 'Admin', PARENT: 'Elternteil', CHILD: 'Kind' };
const colors = ['#345B48', '#D6855F', '#6C8AB8', '#8A7060', '#6A7E3A', '#9A6C8D'];
const initials = (name: string) => name.split(/\s+/).map(word => word[0]).slice(0, 2).join('').toUpperCase();

export function FamilyPage() {
  const family = useFamilyMembers();
  const session = useAuthSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const canManage = session.data?.user?.role !== 'CHILD';

  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
      <Box><Typography variant="h3" sx={{ fontSize: { xs: '2.15rem', md: '3.1rem' } }}>Unsere Familie</Typography><Typography color="text.secondary" mt={0.5}>Alle Personen, Farben und Rollen an einem Ort.</Typography></Box>
      {canManage && <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialogOpen(true)}>Familienmitglied hinzufügen</Button>}
    </Stack>

    {family.isError && <Alert severity="error">{family.error instanceof ApiError ? family.error.message : 'Familienmitglieder konnten nicht geladen werden.'}</Alert>}
    {family.isLoading
      ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 }}>{[0, 1, 2].map(index => <Skeleton key={index} variant="rounded" height={180} />)}</Box>
      : family.data?.length === 0
        ? canManage ? <EmptyFamily onAdd={() => setDialogOpen(true)} /> : <Alert severity="info">Noch keine Familienprofile vorhanden.</Alert>
        : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 }}>{family.data?.map(member => <Card key={member.id} component="article" sx={{ borderTop: `5px solid ${member.color}` }}><CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}><Stack direction="row" spacing={2} alignItems="center"><Avatar src={member.avatarUrl ?? undefined} sx={{ width: 60, height: 60, fontSize: '1.25rem', bgcolor: member.color }}>{initials(member.name)}</Avatar><Box sx={{ minWidth: 0, flex: 1 }}><Typography variant="h6" noWrap>{member.name}</Typography><Typography color="text.secondary">{roleLabels[member.role]}</Typography></Box><Chip size="small" color={member.isActive ? 'success' : 'default'} label={member.isActive ? 'Aktiv' : 'Inaktiv'} /></Stack></CardContent></Card>)}</Box>}

    {canManage && <AddMemberDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />}
  </Stack>;
}

function EmptyFamily({ onAdd }: { onAdd: () => void }) {
  return <Card><CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}><PersonAddAlt1Rounded color="primary" sx={{ fontSize: 56 }} /><Typography variant="h5" mt={1.5}>Beginnt mit eurer Familie</Typography><Typography color="text.secondary" mt={1}>Lege zuerst die Familienmitglieder an. Ihre Farben werden später in Kalendern, Aufgaben und Routinen wiederverwendet.</Typography><Button variant="contained" sx={{ mt: 3 }} onClick={onAdd}>Erstes Familienmitglied hinzufügen</Button></CardContent></Card>;
}

function AddMemberDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMember = useCreateFamilyMember();
  const [form, setForm] = useState<CreateFamilyMemberInput>({ name: '', role: 'CHILD', color: colors[0], pin: '' });
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
      setForm({ name: '', role: 'CHILD', color: colors[0], pin: '' });
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Das Familienmitglied konnte nicht gespeichert werden.');
    }
  };

  return <Dialog open={open} onClose={close} fullWidth maxWidth="xs" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>Familienmitglied hinzufügen</DialogTitle>
    <DialogContent>
      <Stack spacing={2.5} pt={1}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField autoFocus required label="Name" value={form.name} onChange={event => update('name', event.target.value)} inputProps={{ maxLength: 80 }} fullWidth />
        <FormControl fullWidth><InputLabel id="family-role-label">Rolle</InputLabel><Select labelId="family-role-label" label="Rolle" value={form.role} onChange={event => update('role', event.target.value as FamilyRole)}>{(Object.keys(roleLabels) as FamilyRole[]).map(role => <MenuItem key={role} value={role}>{roleLabels[role]}</MenuItem>)}</Select></FormControl>
        {form.role === 'CHILD'
          ? <TextField label="PIN (optional)" type="password" value={form.pin ?? ''} onChange={event => update('pin', event.target.value)} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 8 }} helperText="4 bis 8 Ziffern für den Kinderzugang." fullWidth />
          : <TextField required label="Passwort" type="password" autoComplete="new-password" value={form.password ?? ''} onChange={event => update('password', event.target.value)} inputProps={{ maxLength: 128 }} helperText="Mindestens 8 Zeichen für den Erwachsenenzugang." fullWidth />}
        <Box><Typography variant="subtitle2" mb={1}>Farbe</Typography><Stack direction="row" gap={1} flexWrap="wrap">{colors.map(color => <Button key={color} aria-label={`Farbe ${color}`} onClick={() => update('color', color)} variant={form.color === color ? 'contained' : 'outlined'} sx={{ minWidth: 48, width: 48, p: 0, borderColor: color, bgcolor: form.color === color ? color : 'transparent', '&:hover': { bgcolor: color, borderColor: color } }} />)}</Stack><FormHelperText>Diese Farbe erscheint bei Aufgaben und Terminen.</FormHelperText></Box>
      </Stack>
    </DialogContent>
    <DialogActions sx={{ p: 2.5, pt: 1.5 }}><Button onClick={close}>Abbrechen</Button><Button type="submit" variant="contained" disabled={createMember.isPending}>{createMember.isPending ? 'Wird gespeichert …' : 'Hinzufügen'}</Button></DialogActions>
  </Dialog>;
}
