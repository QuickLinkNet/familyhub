export type ShoppingCategory = 'PRODUCE' | 'BAKERY' | 'DAIRY' | 'MEAT' | 'PANTRY' | 'FROZEN' | 'DRINKS' | 'HOUSEHOLD' | 'HYGIENE' | 'OTHER';

export interface ShoppingItem {
  id: string; listId: string; name: string; quantity: string | null; category: ShoppingCategory; note: string | null;
  isUrgent: boolean; isChecked: boolean; addedBy: { id: string; name: string | null }; checkedBy: { id: string; name: string | null } | null;
  checkedAt: string | null; createdAt: string; updatedAt: string;
}
export interface ShoppingList { id: string; name: string; icon: string; color: string; items: ShoppingItem[]; createdAt: string; updatedAt: string; }
export interface CreateShoppingListInput { name: string; icon: string; color: string; }
export interface ShoppingItemInput { name: string; quantity: string; category: ShoppingCategory; note: string; isUrgent: boolean; }
