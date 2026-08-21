import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, User } from '@teamflow/contracts';
import { PriorityBadge, Avatar, isOverdueTask } from '@/entities/task';
import { cn } from '@/shared/lib/cn';

interface BoardTaskCardProps {
  task: Task;
  assignee: User | null;
  onClick: () => void;
  isOverlay?: boolean;
}

export function BoardTaskCard({ task, assignee, onClick, isOverlay = false }: BoardTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onKeyDown={(event) => {
        // Space is reserved for dnd-kit's keyboard-drag pickup (attributes/listeners
        // above already bind it); only Enter opens the task here.
        if (event.key === 'Enter') onClick();
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open task ${task.title}`}
      className={cn(
        'flex cursor-grab flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 text-left shadow-sm active:cursor-grabbing dark:border-neutral-800 dark:bg-neutral-900',
        isDragging && !isOverlay && 'opacity-40',
        isOverlay && 'rotate-2 shadow-lg',
      )}
    >
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{task.title}</p>
      <div className="flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        <Avatar user={assignee} />
      </div>
      {isOverdueTask(task) ? <p className="text-xs font-medium text-red-600">Overdue</p> : null}
    </div>
  );
}
