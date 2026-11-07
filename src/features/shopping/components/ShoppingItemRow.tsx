import { DeleteOutlineRounded, PriorityHighRounded } from '@mui/icons-material';
import { Box, Checkbox, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { categoryMeta } from '../constants/categories';
import { useDeleteShoppingItem, useToggleShoppingItem } from '../hooks/useShopping';
import type { ShoppingItem } from '../types/shopping';

export function ShoppingItemRow({ item, color }: { item: ShoppingItem; color: string }) {
  const toggle = useToggleShoppingItem(); const remove = useDeleteShoppingItem(); const meta = categoryMeta[item.category];
  return <Paper component="article" variant="outlined" sx={{ p: 1.25, opacity: item.isChecked ? 0.62 : 1, borderLeft: item.isUrgent && !item.isChecked ? '5px solid' : '1px solid', borderLeftColor: item.isUrgent && !item.isChecked ? 'error.main' : 'divider' }}>
    <Stack direction="row" alignItems="center" gap={1}>
      <Checkbox checked={item.isChecked} onChange={() => toggle.mutate(item.id)} disabled={toggle.isPending} inputProps={{ 'aria-label': `${item.name} ${item.isChecked ? 'wieder öffnen' : 'abhaken'}` }} sx={{ minWidth: 48, minHeight: 48, color, '&.Mui-checked': { color } }} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap"><Typography fontWeight={750} sx={{ textDecoration: item.isChecked ? 'line-through' : 'none' }}>{item.name}</Typography>{item.quantity && <Chip size="small" label={item.quantity} />}{item.isUrgent && !item.isChecked && <Chip size="small" color="error" icon={<PriorityHighRounded />} label="Dringend" />}</Stack>
        <Typography variant="body2" color="text.secondary">{meta.icon} {meta.label}{item.isChecked && item.checkedBy?.name ? ` · abgehakt von ${item.checkedBy.name}` : item.addedBy.name ? ` · von ${item.addedBy.name}` : ''}</Typography>
      </Box>
      <IconButton aria-label={`${item.name} entfernen`} color="error" onClick={() => remove.mutate(item.id)} disabled={remove.isPending}><DeleteOutlineRounded /></IconButton>
    </Stack>
  </Paper>;
}
