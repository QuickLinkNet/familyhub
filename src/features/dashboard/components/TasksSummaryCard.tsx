import { CheckCircleRounded } from '@mui/icons-material';
import { Button, LinearProgress, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardCard } from '../../../components/molecules/DashboardCard';

interface TasksSummaryCardProps {
  openCount: number;
  completedCount: number;
  totalCount: number;
  loading: boolean;
  error: boolean;
}

export function TasksSummaryCard({ openCount, completedCount, totalCount, loading, error }: TasksSummaryCardProps) {
  const progress = totalCount === 0 ? 0 : Math.round(completedCount / totalCount * 100);
  return (
    <DashboardCard title="Aufgaben" icon={<CheckCircleRounded color="success" />} accent="#4f8a62">
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography variant="h3">{loading || error ? '–' : openCount}</Typography>
        <Typography color="text.secondary">offen</Typography>
      </Stack>
      <LinearProgress aria-label={`${completedCount} von ${totalCount} Aufgaben erledigt`} variant="determinate" value={progress} color="success" sx={{ height: 10, borderRadius: 10, mt: 1.5 }} />
      <Typography color="text.secondary" mt={1}>{error ? 'Aufgaben konnten nicht geladen werden' : totalCount === 0 ? 'Noch keine Aufgaben angelegt' : `${completedCount} von ${totalCount} erledigt`}</Typography>
      <Button component={Link} to="/tasks" sx={{ mt: 1 }} variant="text">Aufgaben ansehen</Button>
    </DashboardCard>
  );
}
