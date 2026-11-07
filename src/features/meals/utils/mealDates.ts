export const localDate = (date: Date) => {
  const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
export const weekStart = (date: Date) => { const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate()); const day = copy.getDay() || 7; copy.setDate(copy.getDate() - day + 1); return copy; };
export const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
export const weekDays = (start: Date) => Array.from({ length: 7 }, (_, index) => addDays(start, index));
