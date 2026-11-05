import type { ReactNode } from 'react';
import { Chip, Typography } from '@mui/material';
import { DashboardCard } from '../../../components/molecules/DashboardCard';

interface ComingSoonCardProps {
  title: string;
  icon: ReactNode;
  accent: string;
  text: string;
}

export function ComingSoonCard({ title, icon, accent, text }: ComingSoonCardProps) {
  return (
    <DashboardCard title={title} icon={icon} accent={accent}>
      <Chip size="small" label="In Vorbereitung" variant="outlined" />
      <Typography color="text.secondary" mt={1.5}>{text}</Typography>
    </DashboardCard>
  );
}
