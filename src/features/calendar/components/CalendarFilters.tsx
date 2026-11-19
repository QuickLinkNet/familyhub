import { BookmarkAddedRounded, BookmarkAddRounded, RestartAltRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { FamilyMember } from '../../family/types/familyMember';

export interface CalendarFilterOption {
  id: string;
  name: string;
  color: string;
}

interface CalendarFiltersProps {
  members: FamilyMember[];
  calendars: CalendarFilterOption[];
  memberIds: string[];
  calendarIds: string[];
  onMembersChange: (ids: string[]) => void;
  onCalendarsChange: (ids: string[]) => void;
  defaultSaved: boolean;
  loadingDefault: boolean;
  savingDefault: boolean;
  onSaveDefault: () => void;
}

function toggle(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
}

export function CalendarFilters(props: CalendarFiltersProps) {
  const { members, calendars, memberIds, calendarIds, onMembersChange, onCalendarsChange, defaultSaved, loadingDefault, savingDefault, onSaveDefault } = props;
  const active = memberIds.length + calendarIds.length > 0;

  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1.25}>
          <FilterRow label="Personen">
            <Chip label="Alle" color={memberIds.length === 0 ? 'primary' : 'default'} variant={memberIds.length === 0 ? 'filled' : 'outlined'} onClick={() => onMembersChange([])} />
            {members.map(member => (
              <Chip
                key={member.id}
                avatar={<MemberAvatar name={member.name} sx={{ bgcolor: member.color }} />}
                label={member.name}
                color={memberIds.includes(member.id) ? 'primary' : 'default'}
                variant={memberIds.includes(member.id) ? 'filled' : 'outlined'}
                onClick={() => onMembersChange(toggle(memberIds, member.id))}
              />
            ))}
          </FilterRow>
          <FilterRow label="Kalender">
            <Chip label="Alle" color={calendarIds.length === 0 ? 'primary' : 'default'} variant={calendarIds.length === 0 ? 'filled' : 'outlined'} onClick={() => onCalendarsChange([])} />
            {calendars.map(calendar => (
              <Chip
                key={calendar.id}
                icon={<Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: calendar.color }} />}
                label={calendar.name}
                color={calendarIds.includes(calendar.id) ? 'primary' : 'default'}
                variant={calendarIds.includes(calendar.id) ? 'filled' : 'outlined'}
                onClick={() => onCalendarsChange(toggle(calendarIds, calendar.id))}
              />
            ))}
            {active && <Button size="small" startIcon={<RestartAltRounded />} onClick={() => { onMembersChange([]); onCalendarsChange([]); }}>Zurücksetzen</Button>}
          </FilterRow>
          <Stack direction="row" justifyContent="flex-end">
            <Button
              size="small"
              variant={defaultSaved ? 'text' : 'outlined'}
              startIcon={defaultSaved ? <BookmarkAddedRounded /> : <BookmarkAddRounded />}
              disabled={defaultSaved || loadingDefault || savingDefault}
              onClick={onSaveDefault}
            >
              {loadingDefault ? 'Standard wird geladen …' : savingDefault ? 'Wird gespeichert …' : defaultSaved ? 'Aktueller Standard' : 'Als Standard speichern'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ width: { sm: 76 }, flexShrink: 0 }}>{label}</Typography>
      <Stack direction="row" gap={0.75} flexWrap="wrap">{children}</Stack>
    </Stack>
  );
}
