export const localDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const dueLabel = (value: string, today = localDate(new Date())) => {
  if (value < today) return `Seit ${new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`))} fällig`;
  if (value === today) return 'Heute dran';
  const tomorrow = localDate(addDays(new Date(), 1));
  if (value === tomorrow) return 'Morgen';
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`));
};
