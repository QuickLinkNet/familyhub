import type { ReactNode } from 'react';
import { CheckCircleRounded, InfoRounded, WarningAmberRounded } from '@mui/icons-material';
import { Paper, Stack, Typography } from '@mui/material';

type StatusTone = 'success' | 'info' | 'warning';

interface DisplaySetupStatusCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: StatusTone;
}

const toneIcons = {
  success: <CheckCircleRounded color="success" fontSize="small" />,
  info: <InfoRounded color="info" fontSize="small" />,
  warning: <WarningAmberRounded color="warning" fontSize="small" />
};

export function DisplaySetupStatusCard({ icon, label, value, tone = 'info' }: DisplaySetupStatusCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 3, minWidth: 0 }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        {icon}
        <Stack minWidth={0} flex={1}>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography variant="subtitle2" noWrap>{value}</Typography>
        </Stack>
        {toneIcons[tone]}
      </Stack>
    </Paper>
  );
}
