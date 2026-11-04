import type { ReactNode } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';

interface DashboardCardProps { title: string; icon: ReactNode; accent: string; children: ReactNode; action?: ReactNode; }

export function DashboardCard({ title, icon, accent, children, action }: DashboardCardProps) {
  return <Card component="section" aria-label={title} sx={{ height: '100%', borderTop: `5px solid ${accent}` }}>
    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} mb={2}>
        <Stack direction="row" alignItems="center" spacing={1.25}><span aria-hidden="true">{icon}</span><Typography variant="h6">{title}</Typography></Stack>
        {action}
      </Stack>
      {children}
    </CardContent>
  </Card>;
}
