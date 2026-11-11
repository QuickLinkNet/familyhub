import { ArrowForwardRounded } from '@mui/icons-material';
import { Avatar, Box, Chip, List, ListItem, ListItemButton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { ReminderItem } from '../types/reminder';
import { reminderTimeLabel, urgencyColors } from '../utils/reminderLabels';
import { ReminderTypeIcon } from './ReminderTypeIcon';

interface ReminderListProps {
  items: ReminderItem[];
  limit?: number;
  compact?: boolean;
  onNavigate?: () => void;
}

export function ReminderList({ items, limit = items.length, compact = false, onNavigate }: ReminderListProps) {
  return <List disablePadding aria-label="Persönliche Erinnerungen">
    {items.slice(0, limit).map((item, index) => {
      const colors = urgencyColors[item.urgency];
      return <ListItem key={item.id} disablePadding sx={{ borderTop: index === 0 ? 0 : '1px solid', borderColor: 'divider' }}>
        <ListItemButton component={Link} to={item.action.href} onClick={onNavigate} sx={{ gap: 1.5, alignItems: 'flex-start', px: compact ? 1 : 1.5, py: compact ? 1.25 : 1.5, borderRadius: 2 }}>
          <Avatar sx={{ width: compact ? 38 : 44, height: compact ? 38 : 44, bgcolor: colors.soft, color: colors.main }}><ReminderTypeIcon type={item.type} /></Avatar>
          <Box minWidth={0} flex={1}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
              <Typography fontWeight={800} noWrap={compact}>{item.title}</Typography>
              <Chip size="small" label={reminderTimeLabel(item)} sx={{ flexShrink: 0, bgcolor: colors.soft, color: colors.main, fontWeight: 800 }} />
            </Stack>
            <Typography variant="body2" color="text.secondary" mt={0.25}>{item.message}</Typography>
          </Box>
          {!compact && <ArrowForwardRounded color="action" sx={{ mt: 1 }} />}
        </ListItemButton>
      </ListItem>;
    })}
  </List>;
}
