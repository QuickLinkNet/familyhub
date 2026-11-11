import { CalendarMonthRounded, CheckCircleRounded, FactCheckRounded, SchoolRounded, WbTwilightRounded } from '@mui/icons-material';
import type { ReminderType } from '../types/reminder';

export function ReminderTypeIcon({ type }: { type: ReminderType }) {
  if (type === 'EVENT') return <CalendarMonthRounded />;
  if (type === 'SCHOOL') return <SchoolRounded />;
  if (type === 'ROUTINE') return <WbTwilightRounded />;
  if (type === 'VERIFICATION') return <FactCheckRounded />;
  return <CheckCircleRounded />;
}
