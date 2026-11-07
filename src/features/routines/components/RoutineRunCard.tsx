import { CheckCircleRounded } from '@mui/icons-material';
import { Alert, Box, Card, CardContent, Checkbox, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import { designTokens } from '../../../theme/designTokens';
import { ApiError } from '../../../services/apiClient';
import type { AuthRole } from '../../auth/types/auth';
import { useCompleteRoutineStep } from '../hooks/useRoutines';
import type { RoutineRun } from '../types/routine';

interface RoutineRunCardProps {
  run: RoutineRun;
  userId: string | null;
  userRole: AuthRole | null;
}

export function RoutineRunCard({ run, userId, userRole }: RoutineRunCardProps) {
  const complete = useCompleteRoutineStep();
  const allowed = userRole !== 'CHILD' || run.assignedMember.id === userId;
  const percent = run.progress.total === 0 ? 0 : Math.round((run.progress.completed / run.progress.total) * 100);

  return (
    <Card component="article" sx={{ borderTop: `5px solid ${run.assignedMember.color}`, opacity: run.status === 'COMPLETED' ? 0.78 : 1 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5}>
          <Box>
            <Typography variant="h6">{run.title}</Typography>
            {run.description && <Typography color="text.secondary" variant="body2" mt={0.25}>{run.description}</Typography>}
          </Box>
          <Stack direction="row" alignItems="center" gap={1}>
            <MemberAvatar name={run.assignedMember.name} sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: run.assignedMember.color }} />
            <Typography variant="body2" fontWeight={700}>{run.assignedMember.name}</Typography>
            {run.status === 'COMPLETED' && <Chip size="small" color="success" icon={<CheckCircleRounded />} label="Geschafft" />}
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2} mb={0.75}>
          <Typography variant="body2" fontWeight={800}>{run.progress.completed} von {run.progress.total} Schritten</Typography>
          <Typography variant="body2" color="text.secondary">{percent}%</Typography>
        </Stack>
        <LinearProgress variant="determinate" value={percent} color={run.status === 'COMPLETED' ? 'success' : 'primary'} sx={{ height: 9, borderRadius: 5 }} />

        <Stack spacing={0.75} mt={2}>
          {run.steps.map(step => {
            const done = step.status === 'COMPLETED';
            const pending = complete.isPending && complete.variables?.stepId === step.id;
            return (
              <Stack key={step.id} direction="row" alignItems="center" gap={1} sx={{ minHeight: 52, px: 1, borderRadius: 2.5, bgcolor: done ? designTokens.surface.selected : 'transparent' }}>
                <Checkbox checked={done} disabled={done || !allowed || complete.isPending} onChange={() => complete.mutate({ runId: run.id, stepId: step.id })} inputProps={{ 'aria-label': `${step.title} erledigen` }} />
                <Typography sx={{ flex: 1, textDecoration: done ? 'line-through' : 'none', color: done ? 'text.secondary' : 'text.primary', fontWeight: done ? 500 : 700 }}>{step.title}</Typography>
                {pending && <Typography variant="caption" color="text.secondary">Speichert …</Typography>}
              </Stack>
            );
          })}
        </Stack>
        {!allowed && <Typography variant="caption" color="text.secondary">Nur {run.assignedMember.name} kann diese Schritte abhaken.</Typography>}
        {complete.isError && <Alert severity="error" sx={{ mt: 1.5 }}>{complete.error instanceof ApiError ? complete.error.message : 'Der Schritt konnte nicht gespeichert werden.'}</Alert>}
      </CardContent>
    </Card>
  );
}
