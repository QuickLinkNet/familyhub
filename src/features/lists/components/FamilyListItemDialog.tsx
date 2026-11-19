import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useFamilyMembers } from '../../family/hooks/useFamilyMembers';
import { useUpdateFamilyListItem } from '../hooks/useFamilyLists';
import type { FamilyListItem } from '../types/familyList';

export function FamilyListItemDialog({ item, onClose }: { item: FamilyListItem | null; onClose: () => void }) {
  const update = useUpdateFamilyListItem(); const members = useFamilyMembers();
  const [title, setTitle] = useState(''); const [note, setNote] = useState(''); const [assignee, setAssignee] = useState(''); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (item) { setTitle(item.title); setNote(item.note ?? ''); setAssignee(item.assignedTo?.id ?? ''); setError(null); } }, [item]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!item) return; setError(null);
    try { await update.mutateAsync({ id: item.id, item: { title, note, assignedToMemberId: assignee || null } }); onClose(); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Der Listenpunkt konnte nicht gespeichert werden.'); }
  };
  return <Dialog open={item !== null} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>Listenpunkt bearbeiten</DialogTitle><DialogContent><Stack spacing={2} pt={1}>{error && <Alert severity="error">{error}</Alert>}<TextField autoFocus required label="Listenpunkt" value={title} onChange={event => setTitle(event.target.value)} inputProps={{ maxLength: 120 }} /><TextField multiline minRows={2} label="Notiz" value={note} onChange={event => setNote(event.target.value)} inputProps={{ maxLength: 300 }} /><FormControl><InputLabel id="edit-list-assignee-label">Verantwortlich</InputLabel><Select labelId="edit-list-assignee-label" label="Verantwortlich" value={assignee} onChange={event => setAssignee(event.target.value)}><MenuItem value="">Gemeinsam</MenuItem>{members.data?.filter(member => member.isActive).map(member => <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>)}</Select></FormControl></Stack></DialogContent>
    <DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Abbrechen</Button><Button type="submit" variant="contained" disabled={update.isPending || !title.trim()}>Speichern</Button></DialogActions>
  </Dialog>;
}
