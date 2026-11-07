import { PushPinRounded } from '@mui/icons-material';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { FamilyNoteCard } from '../../notes/components/FamilyNoteCard';
import type { FamilyNote } from '../../notes/types/familyNote';

export function WallNotes({ notes }: { notes: FamilyNote[] }) {
  return <Card>
    <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
      <Stack direction="row" alignItems="center" gap={1} mb={2.5}><PushPinRounded color="secondary" /><Typography variant="h5">An unserer Pinnwand</Typography></Stack>
      {notes.length === 0
        ? <Typography color="text.secondary">Heute hängt noch kein Hinweis an der Pinnwand.</Typography>
        : <Stack display="grid" sx={{ gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>{notes.slice(0, 3).map(note => <FamilyNoteCard key={note.id} note={note} compact canManage={false} onEdit={() => undefined} onDelete={() => undefined} />)}</Stack>}
    </CardContent>
  </Card>;
}
