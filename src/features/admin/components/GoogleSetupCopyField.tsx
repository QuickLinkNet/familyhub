import { useState } from 'react';
import { CheckRounded, ContentCopyRounded } from '@mui/icons-material';
import { Button, TextField } from '@mui/material';

interface GoogleSetupCopyFieldProps {
  label: string;
  value: string;
}

export function GoogleSetupCopyField({ label, value }: GoogleSetupCopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      size="small"
      slotProps={{
        input: {
          readOnly: true,
          endAdornment: (
            <Button
              size="small"
              color={copied ? 'success' : 'primary'}
              startIcon={copied ? <CheckRounded /> : <ContentCopyRounded />}
              onClick={copy}
            >
              {copied ? 'Kopiert' : 'Kopieren'}
            </Button>
          ),
        },
      }}
      sx={{ '& input': { fontFamily: 'monospace', fontSize: 13 } }}
    />
  );
}
