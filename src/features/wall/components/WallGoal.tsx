import { AutoAwesomeRounded } from '@mui/icons-material';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { GoalProgress } from '../../goals/components/GoalProgress';
import type { FamilyGoal } from '../../goals/types/familyGoal';

export function WallGoal({ goal }: { goal?: FamilyGoal }) {
  if (!goal) return null;
  return <Card sx={{ color: 'white', background: `linear-gradient(120deg, ${goal.color} 0%, #284b3a 110%)`, position: 'relative', overflow: 'hidden' }}>
    <AutoAwesomeRounded sx={{ position: 'absolute', right: 24, top: 20, fontSize: 110, opacity: 0.12 }} />
    <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, '&:last-child': { pb: { xs: 2.5, md: 3.5 } } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2.5}>
        <Box sx={{ fontSize: 54 }}>{goal.icon}</Box><Box flex={1}><Typography variant="overline" sx={{ opacity: 0.8 }}>Unser Familienziel</Typography><Typography variant="h4" mb={1.5}>{goal.title}</Typography><GoalProgress current={goal.currentValue} target={goal.targetValue} color="#FFFFFF" /></Box>
      </Stack>
    </CardContent>
  </Card>;
}
