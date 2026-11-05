import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'center' }}
      gap={2}
    >
      <Box>
        <Typography variant="h3" sx={{ fontSize: { xs: '2.15rem', md: '3.1rem' } }}>
          {title}
        </Typography>
        <Typography color="text.secondary" mt={0.5}>{description}</Typography>
      </Box>
      {actions}
    </Stack>
  );
}
