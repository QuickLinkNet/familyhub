import { HelpOutlineRounded } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export function ContextHelpLink({ topic, label = 'Hilfe' }: { topic: string; label?: string }) {
  return (
    <Button component={Link} to={`/help#${topic}`} size="small" variant="text" startIcon={<HelpOutlineRounded />}>
      {label}
    </Button>
  );
}
