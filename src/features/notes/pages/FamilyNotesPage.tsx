import { AddRounded, PushPinRounded } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { FamilyNoteCard } from '../components/FamilyNoteCard';
import { FamilyNoteDialog } from '../components/FamilyNoteDialog';
import { useDeleteFamilyNote, useFamilyNotes } from '../hooks/useFamilyNotes';
import type { FamilyNote } from '../types/familyNote';

export function FamilyNotesPage() {
  const query = useFamilyNotes(); const session = useAuthSession(); const remove = useDeleteFamilyNote();
  const [dialogOpen, setDialogOpen] = useState(false); const [editing, setEditing] = useState<FamilyNote | null>(null); const [deleting, setDeleting] = useState<FamilyNote | null>(null);
  const user = session.data?.user;
  const canManage = (note: FamilyNote) => user?.role === 'ADMIN' || user?.role === 'PARENT' || note.createdBy.id === user?.id;
  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (note: FamilyNote) => { setEditing(note); setDialogOpen(true); };
  if (query.isLoading) return <Stack alignItems="center" py={8} gap={2}><CircularProgress /><Typography>Pinnwand wird aufgehängt …</Typography></Stack>;
  if (query.isError) return <Alert severity="error">Die Pinnwand konnte nicht geladen werden. Bitte versuche es gleich noch einmal.</Alert>;
  const notes = query.data ?? [];
  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <PageHeader title="Familienpinnwand" description="Kurze Hinweise, liebe Nachrichten und alles, was niemand vergessen soll." actions={<Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>Zettel anpinnen</Button>} />
    {notes.length === 0
      ? <EmptyStateCard icon={<PushPinRounded color="secondary" sx={{ fontSize: 60 }} />} title="Noch ist die Pinnwand frei" description="Pinnt den ersten Hinweis an – zum Beispiel für den Turnbeutel, einen Besuch oder eine kleine Überraschung." action={<Button variant="contained" onClick={openCreate} sx={{ mt: 2 }}>Ersten Zettel anpinnen</Button>} />
      : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 2, md: 2.5 }, alignItems: 'stretch' }}>{notes.map(note => <FamilyNoteCard key={note.id} note={note} canManage={canManage(note)} onEdit={() => openEdit(note)} onDelete={() => setDeleting(note)} />)}</Box>}
    <FamilyNoteDialog open={dialogOpen} note={editing} onClose={() => { setDialogOpen(false); setEditing(null); }} />
    <Dialog open={deleting !== null} onClose={() => setDeleting(null)}><DialogTitle>Zettel abnehmen?</DialogTitle><DialogContent><Typography>„{deleting?.title}“ wird von der Familienpinnwand entfernt.</Typography></DialogContent><DialogActions><Button onClick={() => setDeleting(null)}>Abbrechen</Button><Button color="error" disabled={remove.isPending} onClick={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}>Entfernen</Button></DialogActions></Dialog>
  </Stack>;
}
