import { DeleteOutlineRounded, EditRounded, PushPinRounded, ScheduleRounded } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { FamilyNote } from '../types/familyNote';

interface FamilyNoteCardProps { note: FamilyNote; canManage: boolean; onEdit: () => void; onDelete: () => void; compact?: boolean; }

export function FamilyNoteCard({ note, canManage, onEdit, onDelete, compact = false }: FamilyNoteCardProps) {
  return <Card component="article" sx={{ height: '100%', position: 'relative', overflow: 'visible', borderTop: `6px solid ${note.color}`, bgcolor: `${note.color}0f` }}>
    {note.isImportant && <PushPinRounded aria-label="Wichtiger Hinweis" sx={{ position: 'absolute', right: 18, top: -15, color: note.color, transform: 'rotate(18deg)', filter: 'drop-shadow(0 3px 4px #0002)' }} />}
    <CardContent sx={{ p: compact ? 2 : 2.5, '&:last-child': { pb: compact ? 2 : 2.5 } }}>
      <Stack direction="row" gap={1.5} alignItems="flex-start">
        <Box aria-hidden="true" sx={{ width: compact ? 46 : 56, height: compact ? 46 : 56, flex: '0 0 auto', display: 'grid', placeItems: 'center', borderRadius: 3, bgcolor: `${note.color}22`, fontSize: compact ? 26 : 31 }}>{note.icon}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}><Typography variant={compact ? 'h6' : 'h5'}>{note.title}</Typography><Typography mt={0.5} color="text.secondary" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{note.body}</Typography></Box>
        {canManage && !compact && <Stack direction="row"><IconButton aria-label={`${note.title} bearbeiten`} onClick={onEdit}><EditRounded /></IconButton><IconButton aria-label={`${note.title} löschen`} color="error" onClick={onDelete}><DeleteOutlineRounded /></IconButton></Stack>}
      </Stack>
      {!compact && <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ xs: 'flex-start', sm: 'center' }} mt={2}>
        <Stack direction="row" alignItems="center" gap={0.75}><MemberAvatar name={note.createdBy.name} sx={{ width: 28, height: 28, fontSize: 13, bgcolor: note.createdBy.color }} /><Typography variant="body2" color="text.secondary">von {note.createdBy.name}</Typography></Stack>
        {note.expiresOn && <Chip size="small" icon={<ScheduleRounded />} label={`bis ${new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' }).format(new Date(`${note.expiresOn}T12:00:00`))}`} />}
        {note.isImportant && <Chip size="small" color="secondary" label="Wichtig" />}
      </Stack>}
    </CardContent>
  </Card>;
}
