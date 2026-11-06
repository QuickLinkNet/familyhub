import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useRedeemReward } from '../hooks/useRewards';
import type { Reward, RewardBalance } from '../types/reward';

export function RedeemDialog({ reward, balances, userId, isChild, onClose }: { reward: Reward | null; balances: RewardBalance[]; userId: string; isChild: boolean; onClose: () => void }) {
  const redeem = useRedeemReward(); const [memberId, setMemberId] = useState(userId); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (reward) { setMemberId(userId); setError(null); } }, [reward, userId]);
  const balance = balances.find(item => item.member.id === memberId);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!reward) return; setError(null); try { await redeem.mutateAsync({ id: reward.id, memberId: isChild ? undefined : memberId }); onClose(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Die Belohnung konnte nicht eingelöst werden.'); } };
  return <Dialog open={reward !== null} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>{reward?.icon} {reward?.title}</DialogTitle><DialogContent><Stack spacing={2} pt={1}>{error && <Alert severity="error">{error}</Alert>}
      {!isChild && <FormControl><InputLabel id="redeem-member-label">Wer löst ein?</InputLabel><Select labelId="redeem-member-label" label="Wer löst ein?" value={memberId} onChange={event => setMemberId(event.target.value)}>{balances.map(item => <MenuItem key={item.member.id} value={item.member.id}>{item.member.name} · {item.points} Sterne</MenuItem>)}</Select></FormControl>}
      <Alert severity={balance && reward && balance.points >= reward.costPoints ? 'success' : 'info'}>{balance?.member.name ?? 'Dieses Profil'} hat {balance?.points ?? 0} Sterne. Benötigt werden {reward?.costPoints ?? 0}.</Alert>
      <Typography color="text.secondary">Nach dem Einlösen bleibt der Vorgang im Familienverlauf sichtbar.</Typography>
    </Stack></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Abbrechen</Button><Button type="submit" variant="contained" disabled={redeem.isPending || !balance || !reward || balance.points < reward.costPoints}>Jetzt einlösen</Button></DialogActions>
  </Dialog>;
}
