import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import { familyRoleLabels } from '../constants/familyOptions';
import type { FamilyMember } from '../types/familyMember';

export function FamilyMemberCard({ member }: { member: FamilyMember }) {
  return (
    <Card component="article" sx={{ borderTop: `5px solid ${member.color}` }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <MemberAvatar name={member.name} src={member.avatarUrl ?? undefined} sx={{ width: 60, height: 60, fontSize: '1.25rem', bgcolor: member.color }} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" sx={{ lineHeight: 1.2, overflowWrap: 'anywhere' }}>{member.name}</Typography>
            <Typography color="text.secondary">{familyRoleLabels[member.role]}</Typography>
          </Box>
          <Chip size="small" color={member.isActive ? 'success' : 'default'} label={member.isActive ? 'Aktiv' : 'Inaktiv'} />
        </Stack>
      </CardContent>
    </Card>
  );
}
