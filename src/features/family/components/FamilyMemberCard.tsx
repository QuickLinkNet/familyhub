import { CakeRounded, EditRounded } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import { familyRoleLabels } from '../constants/familyOptions';
import type { FamilyMember } from '../types/familyMember';

export function FamilyMemberCard({ member, onEdit }: { member: FamilyMember; onEdit?: () => void }) {
  return (
    <Card component="article" sx={{ borderTop: `5px solid ${member.color}` }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <MemberAvatar name={member.name} src={member.avatarUrl ?? undefined} sx={{ width: 60, height: 60, fontSize: '1.25rem', bgcolor: member.color }} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" sx={{ lineHeight: 1.2, overflowWrap: 'anywhere' }}>{member.name}</Typography>
            <Typography color="text.secondary">{familyRoleLabels[member.role]}</Typography>
          </Box>
          <Stack direction="row" alignItems="center">
            <Chip size="small" color={member.isActive ? 'success' : 'default'} label={member.isActive ? 'Aktiv' : 'Inaktiv'} />
            {onEdit && <IconButton aria-label={`${member.name} bearbeiten`} onClick={onEdit}><EditRounded /></IconButton>}
          </Stack>
        </Stack>
        {member.birthDate && (
          <Stack direction="row" spacing={1} alignItems="center" mt={2} color="text.secondary">
            <CakeRounded fontSize="small" />
            <Typography variant="body2">{new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long' }).format(new Date(`${member.birthDate}T12:00:00`))}</Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
