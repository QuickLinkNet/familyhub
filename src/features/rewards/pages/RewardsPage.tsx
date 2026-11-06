import { AddRounded, AutoAwesomeRounded, CardGiftcardRounded } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { BonusDialog } from '../components/BonusDialog';
import { MemberBalanceCard } from '../components/MemberBalanceCard';
import { RedeemDialog } from '../components/RedeemDialog';
import { RewardActivityList } from '../components/RewardActivityList';
import { RewardCard } from '../components/RewardCard';
import { RewardDialog } from '../components/RewardDialog';
import { useDeleteReward, useRewards } from '../hooks/useRewards';
import type { Reward } from '../types/reward';

export function RewardsPage() {
  const session = useAuthSession(); const rewards = useRewards(); const remove = useDeleteReward();
  const [createOpen, setCreateOpen] = useState(false); const [bonusOpen, setBonusOpen] = useState(false); const [selected, setSelected] = useState<Reward | null>(null); const [deleting, setDeleting] = useState<Reward | null>(null);
  const user = session.data?.user; const canManage = user?.role === 'ADMIN' || user?.role === 'PARENT';
  const data = rewards.data; const ownBalance = data?.balances.find(item => item.member.id === user?.id);
  if (rewards.isLoading) return <Stack alignItems="center" py={8} gap={2}><CircularProgress /><Typography>Schatzkiste wird geöffnet …</Typography></Stack>;
  if (rewards.isError || !data || !user) return <Alert severity="error">Die Schatzkiste konnte nicht geladen werden. Bitte versuche es gleich noch einmal.</Alert>;
  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <PageHeader title="Schatzkiste" description="Gemeinsam Sterne sammeln, Wünsche erfüllen und kleine Erfolge feiern." actions={canManage ? <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}><Button variant="outlined" startIcon={<AutoAwesomeRounded />} onClick={() => setBonusOpen(true)}>Bonus vergeben</Button><Button variant="contained" startIcon={<AddRounded />} onClick={() => setCreateOpen(true)}>Belohnung</Button></Stack> : undefined} />
    <Box sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 5, color: 'white', background: 'linear-gradient(125deg, #284b3a 0%, #3f7258 55%, #d6855f 140%)', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', right: { xs: -20, sm: 30 }, top: -45, fontSize: 150, opacity: 0.12 }}>🎁</Box>
      <Typography variant="overline" sx={{ opacity: 0.82, letterSpacing: 1.5 }}>Euer Familienziel</Typography>
      <Typography variant="h4" maxWidth={580}>Jede erledigte Aufgabe bringt euch einem schönen Familienmoment näher.</Typography>
      <Typography mt={1} sx={{ opacity: 0.82 }}>Sterne werden erst nach einer nötigen Elternbestätigung gutgeschrieben.</Typography>
    </Box>
    <Box><Typography variant="h5" mb={1.5}>Unsere Sterne</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>{data.balances.map(balance => <MemberBalanceCard key={balance.member.id} balance={balance} highlighted={balance.member.id === user.id} />)}</Box></Box>
    <Box><Stack direction="row" alignItems="center" gap={1} mb={1.5}><CardGiftcardRounded color="secondary" /><Typography variant="h5">Wunschregal</Typography></Stack>
      {data.rewards.length === 0 ? <Alert severity="info">Noch keine Belohnung im Regal. Legt gemeinsam den ersten Wunsch an.</Alert> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>{data.rewards.map(reward => <RewardCard key={reward.id} reward={reward} canManage={canManage} affordable={(ownBalance?.points ?? 0) >= reward.costPoints} onRedeem={() => setSelected(reward)} onDelete={() => setDeleting(reward)} />)}</Box>}
    </Box>
    <Box><Typography variant="h5" mb={1.5}>Sternenbuch</Typography><RewardActivityList activity={data.activity} /></Box>
    <RewardDialog open={createOpen} onClose={() => setCreateOpen(false)} /><BonusDialog open={bonusOpen} balances={data.balances} onClose={() => setBonusOpen(false)} /><RedeemDialog reward={selected} balances={data.balances} userId={user.id} isChild={user.role === 'CHILD'} onClose={() => setSelected(null)} />
    <Dialog open={deleting !== null} onClose={() => setDeleting(null)}><DialogTitle>Belohnung entfernen?</DialogTitle><DialogContent><Typography>„{deleting?.title}“ verschwindet aus dem Wunschregal. Frühere Einlösungen bleiben im Sternenbuch erhalten.</Typography></DialogContent><DialogActions><Button onClick={() => setDeleting(null)}>Abbrechen</Button><Button color="error" onClick={() => { if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) }); }}>Entfernen</Button></DialogActions></Dialog>
  </Stack>;
}
