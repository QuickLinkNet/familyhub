import { GroupsRounded, LockRounded, SupervisorAccountRounded } from '@mui/icons-material';
import { memberColors } from '../../../theme/memberPalette';
import type { ListVisibility } from '../types/familyList';

export const listIcons = ['📋', '🧳', '🏠', '🎉', '💡', '🎁', '🛠️', '🌱'];
export const listColors = memberColors;
export const visibilityOptions: Array<{ value: ListVisibility; label: string; description: string; icon: typeof GroupsRounded }> = [
  { value: 'FAMILY', label: 'Ganze Familie', description: 'Für alle Profile sichtbar', icon: GroupsRounded },
  { value: 'ADULTS', label: 'Nur Erwachsene', description: 'Ideal für Planung und Überraschungen', icon: SupervisorAccountRounded },
  { value: 'PRIVATE', label: 'Nur für mich', description: 'Persönliche, private Liste', icon: LockRounded }
];

export const visibilityMeta = Object.fromEntries(visibilityOptions.map(option => [option.value, option])) as Record<ListVisibility, typeof visibilityOptions[number]>;
