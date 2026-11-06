import type { Task } from '../types/task';

export const localDate = (date = new Date()) => new Intl.DateTimeFormat('sv-SE').format(date);

export const isDueBy = (task: Task, date: string) => task.dueDate === null || task.dueDate <= date;

export const wasCompletedOn = (task: Task, date: string) => task.completedAt !== null && localDate(new Date(task.completedAt)) === date;
