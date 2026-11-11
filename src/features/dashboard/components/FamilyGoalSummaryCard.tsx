import { FlagRounded } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardCard } from '../../../components/molecules/DashboardCard';
import { GoalProgress } from '../../goals/components/GoalProgress';
import type { FamilyGoalBoard } from '../../goals/types/familyGoal';

export function FamilyGoalSummaryCard({ board, loading, error }: { board?: FamilyGoalBoard; loading: boolean; error: boolean }) {
  const goal = board?.activeGoals[0];
  return <DashboardCard title="Familienziel" icon={<FlagRounded color="secondary" />} accent={goal?.color ?? '#D6855F'}>
    {loading || error ? <Typography color="text.secondary">{error ? 'Familienziele konnten nicht geladen werden' : 'Fortschritt wird geladen …'}</Typography>
      : goal ? <><Typography fontSize={32} mb={0.5}>{goal.icon}</Typography><Typography variant="h6" mb={1.5}>{goal.title}</Typography><GoalProgress current={goal.currentValue} target={goal.targetValue} color={goal.color} compact /></>
        : <><Typography variant="h4">🎯</Typography><Typography color="text.secondary" mt={1}>Noch kein gemeinsames Ziel – Zeit für euer nächstes Abenteuer.</Typography></>}
    <Button component={Link} to="/goals" sx={{ mt: 1.5 }}>Ziele öffnen</Button>
  </DashboardCard>;
}
