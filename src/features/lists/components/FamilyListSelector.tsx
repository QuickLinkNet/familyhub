import { CheckCircleRounded } from '@mui/icons-material';
import { ButtonBase, Paper, Stack, Typography } from '@mui/material';
import type { FamilyList } from '../types/familyList';

export function FamilyListSelector({ lists, selectedId, onSelect }: { lists: FamilyList[]; selectedId: string; onSelect: (id: string) => void }) {
  return <Stack direction="row" gap={1.25} sx={{ overflowX: 'auto', pb: 0.5 }}>
    {lists.map(list => {
      const open = list.items.filter(item => !item.isCompleted).length; const selected = list.id === selectedId;
      return <Paper key={list.id} variant="outlined" sx={{ flex: '0 0 auto', overflow: 'hidden', borderColor: selected ? list.color : 'divider', borderWidth: selected ? 2 : 1 }}>
        <ButtonBase onClick={() => onSelect(list.id)} sx={{ minWidth: 170, minHeight: 76, p: 1.5, justifyContent: 'flex-start', textAlign: 'left' }}>
          <Stack direction="row" alignItems="center" gap={1.25}><Typography fontSize="1.75rem">{list.icon}</Typography><Stack><Typography fontWeight={800}>{list.name}</Typography><Typography variant="body2" color="text.secondary">{open === 0 ? <><CheckCircleRounded sx={{ fontSize: '1em', verticalAlign: 'middle' }} /> Alles erledigt</> : `${open} offen`}</Typography></Stack></Stack>
        </ButtonBase>
      </Paper>;
    })}
  </Stack>;
}
