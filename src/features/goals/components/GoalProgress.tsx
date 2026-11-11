import { Box, LinearProgress, Stack, Typography } from '@mui/material';

export function GoalProgress({ current, target, color, compact = false }: { current: number; target: number; color: string; compact?: boolean }) {
  const percentage = Math.min(100, Math.round((current / target) * 100));
  return <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={0.75}>
      <Typography fontWeight={800}>{current} von {target} Schritten</Typography>
      <Typography variant={compact ? 'body2' : 'h6'} fontWeight={900} sx={{ color }}>{percentage}%</Typography>
    </Stack>
    <LinearProgress aria-label={`${current} von ${target} Schritten geschafft`} variant="determinate" value={percentage} sx={{ height: compact ? 9 : 13, borderRadius: 20, bgcolor: `${color}22`, '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 20 } }} />
  </Box>;
}
