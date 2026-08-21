import type { TaskStatus } from '@teamflow/contracts';
import { cn } from '@/shared/lib/cn';

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

const STATUS_CLASSES: Record<TaskStatus, string> = {
  todo: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  done: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_CLASSES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
