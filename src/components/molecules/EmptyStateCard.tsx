import type { ReactNode } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';

interface EmptyStateCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyStateCard({ icon, title, description, action }: EmptyStateCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
        <Stack alignItems="center" spacing={1}>
          {icon}
          <Typography variant="h5">{title}</Typography>
          <Typography color="text.secondary">{description}</Typography>
          {action}
        </Stack>
      </CardContent>
    </Card>
  );
}
