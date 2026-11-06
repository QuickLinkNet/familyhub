import { StarRounded } from '@mui/icons-material';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { RewardBalance } from '../types/reward';

export function MemberBalanceCard({ balance, highlighted }: { balance: RewardBalance; highlighted: boolean }) {
  return (
    <Card sx={{ position: 'relative', overflow: 'hidden', border: highlighted ? `2px solid ${balance.member.color}` : '2px solid transparent', background: `linear-gradient(145deg, #fff 55%, ${balance.member.color}1f)` }}>
      <Box sx={{ position: 'absolute', right: -18, top: -28, fontSize: 92, opacity: 0.08 }}>★</Box>
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Stack direction="row" alignItems="center" gap={1.25}>
          <MemberAvatar name={balance.member.name} src={balance.member.avatarUrl ?? undefined} sx={{ bgcolor: balance.member.color, width: 48, height: 48 }} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography fontWeight={750} noWrap>{balance.member.name}</Typography>
            <Stack direction="row" alignItems="center" gap={0.4}>
              <StarRounded sx={{ color: 'warning.main', fontSize: 24 }} />
              <Typography variant="h4" component="span">{balance.points}</Typography>
              <Typography color="text.secondary">Sterne</Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
