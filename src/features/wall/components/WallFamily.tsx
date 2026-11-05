import { FamilyRestroomRounded } from '@mui/icons-material';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { FamilyMember } from '../../family/types/familyMember';

export function WallFamily({ members }: { members: FamilyMember[] }) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2.5}>
          <Stack direction="row" alignItems="center" gap={1}><FamilyRestroomRounded color="secondary" /><Typography variant="h5">Unsere Familie</Typography></Stack>
          <Stack direction="row" gap={1.25} flexWrap="wrap">
            {members.map(member => <Stack key={member.id} alignItems="center" spacing={0.5}><MemberAvatar name={member.name} src={member.avatarUrl ?? undefined} sx={{ width: 50, height: 50, bgcolor: member.color }} /><Typography variant="caption" fontWeight={700}>{member.name.split(' ')[0]}</Typography></Stack>)}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
