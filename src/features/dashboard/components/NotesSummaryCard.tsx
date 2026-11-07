import { PushPinRounded } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardCard } from '../../../components/molecules/DashboardCard';
import type { FamilyNote } from '../../notes/types/familyNote';

export function NotesSummaryCard({ notes, loading, error }: { notes: FamilyNote[]; loading: boolean; error: boolean }) {
  const important = notes.filter(note => note.isImportant);
  return <DashboardCard title="Pinnwand" icon={<PushPinRounded color="secondary" />} accent="#CB8B33">
    <Stack direction="row" alignItems="baseline" gap={1}><Typography variant="h3">{loading || error ? '–' : notes.length}</Typography><Typography color="text.secondary">Zettel sichtbar</Typography></Stack>
    <Typography color="text.secondary" mt={1}>{error ? 'Pinnwand konnte nicht geladen werden' : important.length > 0 ? `${important.length} ${important.length === 1 ? 'wichtiger Hinweis' : 'wichtige Hinweise'} ganz oben` : notes.length > 0 ? 'Alles im Blick, nichts geht verloren.' : 'Noch Platz für euren ersten Hinweis.'}</Typography>
    <Button component={Link} to="/notes" sx={{ mt: 1 }}>Pinnwand öffnen</Button>
  </DashboardCard>;
}
