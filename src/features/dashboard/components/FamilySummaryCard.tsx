import { GroupRounded } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import { DashboardCard } from '../../../components/molecules/DashboardCard';
import type { FamilyMember } from '../../family/types/familyMember';

interface FamilySummaryCardProps {
  members: FamilyMember[];
  loading: boolean;
  error: boolean;
}

export function FamilySummaryCard({ members, loading, error }: FamilySummaryCardProps) {
  const countLabel = `${members.length} ${members.length === 1 ? 'Profil' : 'Profile'} aktiv`;
  return (
    <DashboardCard title="Familie" icon={<GroupRounded color="secondary" />} accent="#d6855f">
      <Stack direction="row" spacing={-0.5} mb={1.5}>
        {members.slice(0, 6).map(member => <MemberAvatar key={member.id} name={member.name} sx={{ bgcolor: member.color, border: '2px solid white' }} />)}
      </Stack>
      <Typography variant="h6">{error ? 'Nicht verfügbar' : loading ? 'Wird geladen …' : countLabel}</Typography>
      <Typography color="text.secondary" mt={0.5}>Rollen, Farben und Zugänge eurer Familie.</Typography>
      <Button component={Link} to="/family" sx={{ mt: 1 }} variant="text">Familie ansehen</Button>
    </DashboardCard>
  );
}
