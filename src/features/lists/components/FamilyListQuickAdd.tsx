import { AddRounded } from '@mui/icons-material';
import { Alert, Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { ApiError } from '../../../services/apiClient';
import { useFamilyMembers } from '../../family/hooks/useFamilyMembers';
import { useCreateFamilyListItem } from '../hooks/useFamilyLists';

export function FamilyListQuickAdd({ listId, color }: { listId: string; color: string }) {
  const add = useCreateFamilyListItem(); const members = useFamilyMembers();
  const [title, setTitle] = useState(''); const [note, setNote] = useState(''); const [assignee, setAssignee] = useState(''); const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(null);
    try { await add.mutateAsync({ listId, item: { title, note, assignedToMemberId: assignee || null } }); setTitle(''); setNote(''); setAssignee(''); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Der Listenpunkt konnte nicht hinzugefügt werden.'); }
  };
  return <Paper component="form" onSubmit={submit} sx={{ p: { xs: 1.5, sm: 2 }, borderTop: '5px solid', borderTopColor: color }}>
    <Stack direction={{ xs: 'column', lg: 'row' }} gap={1.25} alignItems={{ lg: 'center' }}>
      <TextField label="Was steht an?" value={title} onChange={event => setTitle(event.target.value)} inputProps={{ maxLength: 120 }} sx={{ flex: 2 }} />
      <TextField label="Notiz (optional)" value={note} onChange={event => setNote(event.target.value)} inputProps={{ maxLength: 300 }} sx={{ flex: 1.5 }} />
      <FormControl sx={{ flex: 1, minWidth: 170 }}><InputLabel id="list-assignee-label">Verantwortlich</InputLabel><Select labelId="list-assignee-label" label="Verantwortlich" value={assignee} onChange={event => setAssignee(event.target.value)}><MenuItem value="">Gemeinsam</MenuItem>{members.data?.filter(member => member.isActive).map(member => <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>)}</Select></FormControl>
      <Button type="submit" variant="contained" startIcon={<AddRounded />} disabled={add.isPending || !title.trim()}>Hinzufügen</Button>
    </Stack>{error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
  </Paper>;
}
