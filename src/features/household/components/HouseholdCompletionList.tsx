import { CheckCircleRounded } from '@mui/icons-material';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { HouseholdCompletion } from '../types/household';

export function HouseholdCompletionList({ completions }: { completions: HouseholdCompletion[] }) {
  if (completions.length === 0) return null;
  return <Card><CardContent><Stack direction="row" gap={1} alignItems="center" mb={2}><CheckCircleRounded color="success" /><Typography variant="h5">Gerade geschafft</Typography></Stack><Stack spacing={1.25}>{completions.slice(0, 6).map(completion => <Stack key={completion.id} direction="row" gap={1.25} alignItems="center" sx={{ p: 1.25, borderRadius: 3, bgcolor: 'action.hover' }}><MemberAvatar name={completion.completedBy.name} sx={{ bgcolor: completion.completedBy.color, width: 32, height: 32, fontSize: 12 }} /><BoxContent title={completion.title} subtitle={`${completion.completedBy.name} · ${new Intl.DateTimeFormat('de-DE', { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(completion.completedAt))}`} /></Stack>)}</Stack></CardContent></Card>;
}

function BoxContent({ title, subtitle }: { title: string; subtitle: string }) {
  return <span style={{ minWidth: 0 }}><Typography component="span" display="block" fontWeight={800} noWrap>{title}</Typography><Typography component="span" display="block" variant="body2" color="text.secondary">{subtitle}</Typography></span>;
}
