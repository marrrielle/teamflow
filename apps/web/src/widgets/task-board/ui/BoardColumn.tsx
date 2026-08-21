import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus, User } from '@teamflow/contracts';
import { StatusBadge } from '@/entities/task';
import { BoardTaskCard } from './BoardTaskCard';

interface BoardColumnProps {
  status: TaskStatus;
  tasks: readonly Task[];
  usersById: ReadonlyMap<string, User>;
  onTaskClick: (task: Task) => void;
}

export function BoardColumn({ status, tasks, usersById, onTaskClick }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-lg bg-neutral-100 p-3 dark:bg-neutral-900/50">
      <div className="flex items-center justify-between px-1">
        <StatusBadge status={status} />
        <span className="text-xs font-medium text-neutral-400">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex min-h-16 flex-col gap-2">
          {tasks.map((task) => (
            <BoardTaskCard
              key={task.id}
              task={task}
              assignee={task.assigneeId ? (usersById.get(task.assigneeId) ?? null) : null}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
