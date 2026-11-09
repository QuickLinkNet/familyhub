export const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const addDays = (date: Date, days: number) => { const next = new Date(date); next.setDate(next.getDate() + days); return next; };
export const weekStart = (date: Date) => { const start = new Date(date); const day = start.getDay() || 7; start.setDate(start.getDate() - day + 1); start.setHours(12, 0, 0, 0); return start; };
export const shortDate = (value: string) => new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`));
