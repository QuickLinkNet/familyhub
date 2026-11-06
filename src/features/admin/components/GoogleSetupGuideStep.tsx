import type { ReactNode } from 'react';
import { LaunchRounded } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';

interface GoogleSetupGuideStepProps {
  number: number;
  title: string;
  description: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
}

export function GoogleSetupGuideStep({
  number,
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: GoogleSetupGuideStepProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      gap={1.5}
      sx={{ p: { xs: 1.5, sm: 2 }, border: 1, borderColor: 'divider', borderRadius: 3 }}
    >
      <Box
        aria-hidden
        sx={{
          display: 'grid',
          placeItems: 'center',
          width: 32,
          height: 32,
          flex: '0 0 32px',
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontWeight: 900,
        }}
      >
        {number}
      </Box>
      <Stack spacing={1.25} flex={1} minWidth={0}>
        <Typography variant="subtitle1" fontWeight={850}>{title}</Typography>
        <Typography component="div" variant="body2" color="text.secondary">{description}</Typography>
        {actionHref && actionLabel && (
          <Button
            href={actionHref}
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            size="small"
            endIcon={<LaunchRounded />}
            sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
          >
            {actionLabel}
          </Button>
        )}
        {children}
      </Stack>
    </Stack>
  );
}
