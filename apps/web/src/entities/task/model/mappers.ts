import type { Task } from '@teamflow/contracts';

/** Narrows `dueDate` to non-null so callers can format it without a null check. */
export function isOverdueTask(task: Task): task is Task & { dueDate: string } {
  return task.dueDate !== null && task.status !== 'done' && new Date(task.dueDate).getTime() < Date.now();
}
