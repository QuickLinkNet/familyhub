import type { HouseholdCategory, HouseholdRecurrence } from '../types/household';

export const householdCategories: Array<{ value: HouseholdCategory; label: string; color: string }> = [
  { value: 'CLEANING', label: 'Putzen', color: '#5B7DB1' },
  { value: 'TRASH', label: 'Müll', color: '#6F786E' },
  { value: 'PLANTS', label: 'Pflanzen', color: '#4F8A62' },
  { value: 'LAUNDRY', label: 'Wäsche', color: '#9B6BB1' },
  { value: 'PETS', label: 'Tiere', color: '#D6855F' },
  { value: 'OTHER', label: 'Sonstiges', color: '#CB8B33' }
];

export const householdRecurrences: Array<{ value: HouseholdRecurrence; label: string }> = [
  { value: 'ONCE', label: 'Einmalig' },
  { value: 'DAILY', label: 'Täglich' },
  { value: 'WEEKLY', label: 'Wöchentlich' },
  { value: 'BIWEEKLY', label: 'Alle zwei Wochen' },
  { value: 'MONTHLY', label: 'Monatlich' }
];

export const categoryOption = (category: HouseholdCategory) => householdCategories.find(option => option.value === category) ?? householdCategories[5];
export const recurrenceLabel = (recurrence: HouseholdRecurrence) => householdRecurrences.find(option => option.value === recurrence)?.label ?? recurrence;
