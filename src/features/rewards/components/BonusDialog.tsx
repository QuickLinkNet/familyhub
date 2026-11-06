import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useAddBonus } from '../hooks/useRewards';
import type { RewardBalance } from '../types/reward';

export function BonusDialog({ open, balances, onClose }: { open: boolean; balances: RewardBalance[]; onClose: () => void }) {
  const bonus = useAddBonus();
  const [memberId, setMemberId] = useState(''); const [points, setPoints] = useState(5); const [reason, setReason] = useState(''); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setMemberId(balances[0]?.member.id ?? ''); setPoints(5); setReason(''); setError(null); } }, [balances, open]);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(null); try { await bonus.mutateAsync({ memberId, points, reason }); onClose(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Der Bonus konnte nicht vergeben werden.'); } };
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>Überraschungs-Sterne</DialogTitle><DialogContent><Stack spacing={2.25} pt={1}>{error && <Alert severity="error">{error}</Alert>}
      <FormControl><InputLabel id="bonus-member-label">Für wen?</InputLabel><Select labelId="bonus-member-label" label="Für wen?" value={memberId} onChange={event => setMemberId(event.target.value)}>{balances.map(balance => <MenuItem key={balance.member.id} value={balance.member.id}>{balance.member.name}</MenuItem>)}</Select></FormControl>
      <TextField type="number" label="Sterne" value={points} onChange={event => setPoints(Number(event.target.value))} inputProps={{ min: 1, max: 500 }} />
      <TextField required label="Wofür?" value={reason} onChange={event => setReason(event.target.value)} inputProps={{ maxLength: 160 }} placeholder="z. B. Toll geholfen" />
    </Stack></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Abbrechen</Button><Button type="submit" variant="contained" disabled={bonus.isPending || !memberId || reason.trim().length < 2}>Sterne vergeben</Button></DialogActions>
  </Dialog>;
}
