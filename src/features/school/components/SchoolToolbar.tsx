import { ArrowBackIosNewRounded, ArrowForwardIosRounded, TodayRounded } from '@mui/icons-material';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { FamilyMember } from '../../family/types/familyMember';

export function SchoolToolbar({ members, memberId, label, onMember, onPrevious, onNext, onToday }: { members: FamilyMember[]; memberId: string; label: string; onMember: (id: string) => void; onPrevious: () => void; onNext: () => void; onToday: () => void }) {
  return <Stack spacing={2} sx={{ bgcolor: 'background.paper', borderRadius: 4, p: { xs: 2, md: 2.5 }, boxShadow: 1 }}>
    <Stack direction="row" gap={1} overflow="auto" pb={0.5}>{members.map(member => <Button key={member.id} variant={memberId === member.id ? 'contained' : 'outlined'} onClick={() => onMember(member.id)} startIcon={<MemberAvatar name={member.name} sx={{ width: 28, height: 28, bgcolor: member.color, fontSize: 13 }} />} sx={{ flexShrink: 0 }}>{member.name}</Button>)}</Stack>
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}><IconButton aria-label="Vorherige Woche" onClick={onPrevious}><ArrowBackIosNewRounded /></IconButton><Stack alignItems="center"><Typography variant="h6">{label}</Typography><Button size="small" startIcon={<TodayRounded />} onClick={onToday}>Diese Woche</Button></Stack><IconButton aria-label="Nächste Woche" onClick={onNext}><ArrowForwardIosRounded /></IconButton></Stack>
  </Stack>;
}
