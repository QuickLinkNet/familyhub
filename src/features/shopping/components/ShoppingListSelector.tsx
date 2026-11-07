import { Badge, Button, Stack } from '@mui/material';
import type { ShoppingList } from '../types/shopping';

export function ShoppingListSelector({ lists, selectedId, onSelect }: { lists: ShoppingList[]; selectedId: string; onSelect: (id: string) => void }) {
  return <Stack direction="row" gap={1} sx={{ overflowX: 'auto', pb: 0.5 }}>{lists.map(list => {
    const open = list.items.filter(item => !item.isChecked).length;
    return <Badge key={list.id} badgeContent={open} color="secondary"><Button variant={selectedId === list.id ? 'contained' : 'outlined'} onClick={() => onSelect(list.id)} sx={{ whiteSpace: 'nowrap', bgcolor: selectedId === list.id ? list.color : undefined, '&:hover': { bgcolor: selectedId === list.id ? list.color : undefined } }}>{list.icon} {list.name}</Button></Badge>;
  })}</Stack>;
}
