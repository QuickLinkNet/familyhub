import { DeleteOutlineRounded, StarRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import type { Reward } from '../types/reward';

interface RewardCardProps { reward: Reward; canManage: boolean; affordable: boolean; onRedeem: () => void; onDelete: () => void; }

export function RewardCard({ reward, canManage, affordable, onRedeem, onDelete }: RewardCardProps) {
  return (
    <Card component="article" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: `6px solid ${reward.color}` }}>
      <CardContent sx={{ p: 2.25, display: 'flex', flexDirection: 'column', flex: 1, '&:last-child': { pb: 2.25 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ width: 64, height: 64, display: 'grid', placeItems: 'center', borderRadius: 3, bgcolor: `${reward.color}1f`, fontSize: 36 }}>{reward.icon}</Box>
          {canManage && <IconButton aria-label={`${reward.title} löschen`} onClick={onDelete} color="error"><DeleteOutlineRounded /></IconButton>}
        </Stack>
        <Typography variant="h5" mt={1.75}>{reward.title}</Typography>
        <Typography color="text.secondary" mt={0.5} sx={{ flex: 1 }}>{reward.description ?? 'Ein kleiner Wunsch, auf den es sich zu sparen lohnt.'}</Typography>
        <Button variant="contained" onClick={onRedeem} sx={{ mt: 2, bgcolor: reward.color, '&:hover': { bgcolor: reward.color }, justifyContent: 'space-between' }}>
          <span>{affordable ? 'Einlösen' : 'Darauf sparen'}</span>
          <Stack direction="row" alignItems="center" gap={0.3}><StarRounded fontSize="small" />{reward.costPoints}</Stack>
        </Button>
      </CardContent>
    </Card>
  );
}
