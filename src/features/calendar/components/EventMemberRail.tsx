import { Box } from '@mui/material';
import type { CalendarEvent } from '../types/calendar';
import { eventColorGradient } from '../utils/eventColors';

export function EventMemberRail({ event }: { event: CalendarEvent }) {
  return (
    <Box
      aria-hidden
      sx={{
        alignSelf: 'stretch',
        flex: '0 0 5px',
        minHeight: 36,
        borderRadius: 1,
        background: eventColorGradient(event)
      }}
    />
  );
}
