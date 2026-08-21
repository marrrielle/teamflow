import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import type { ProjectId, Task, TaskFilters, TaskStatus } from '@teamflow/contracts';
import { taskStatusSchema } from '@teamflow/contracts';
import { useTasksQuery } from '@/entities/task';
import { useUsersQuery } from '@/entities/user';
import { useChangeTaskStatus, computeDropPosition, needsRenormalization, renormalizedPositions } from '@/features/task/change-status';
import { taskDetailPath } from '@/shared/config/routes';
import { EmptyState, Skeleton } from '@/shared/ui';
import { BoardColumn } from './BoardColumn';
import { BoardTaskCard } from './BoardTaskCard';

type ColumnsState = Record<TaskStatus, Task[]>;

const STATUSES = taskStatusSchema.options;

function isStatusId(id: UniqueIdentifier): id is TaskStatus {
  return (STATUSES as readonly UniqueIdentifier[]).includes(id);
}

function groupByStatus(tasks: readonly Task[]): ColumnsState {
  const columns: ColumnsState = { todo: [], in_progress: [], done: [] };
  for (const task of tasks) {
    columns[task.status].push(task);
  }
  return columns;
}

export function TaskBoard({ projectId, filters }: { projectId: ProjectId; filters: TaskFilters }) {
  const navigate = useNavigate();
  // The board's own ordering is always by position, independent of any list-view sort
  // the filters bar might have set — status/priority/assignee/search still apply.
  const boardFilters: TaskFilters = { ...filters, sortBy: 'position', sortOrder: 'asc' };
  const { data: tasks, isLoading, isError, error } = useTasksQuery(projectId, boardFilters);
  const { data: users } = useUsersQuery();
  const changeStatus = useChangeTaskStatus(projectId, boardFilters);

  const [columns, setColumns] = useState<ColumnsState>(() => groupByStatus([]));
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if (tasks) setColumns(groupByStatus(tasks));
  }, [tasks]);

  const usersById = new Map((users ?? []).map((user) => [user.id as string, user]));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function findColumnOf(taskId: UniqueIdentifier): TaskStatus | undefined {
    return STATUSES.find((status) => columns[status].some((task) => task.id === taskId));
  }

  function handleDragStart(event: DragStartEvent) {
    const task = (tasks ?? []).find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeStatus = findColumnOf(active.id);
    const overStatus = isStatusId(over.id) ? over.id : findColumnOf(over.id);
    if (!activeStatus || !overStatus || activeStatus === overStatus) return;

    setColumns((prev) => {
      const activeItems = prev[activeStatus];
      const activeIndex = activeItems.findIndex((task) => task.id === active.id);
      if (activeIndex === -1) return prev;
      const movingTask = activeItems[activeIndex]!;

      const overItems = prev[overStatus];
      const overIndex = isStatusId(over.id) ? overItems.length : overItems.findIndex((task) => task.id === over.id);
      const insertAt = overIndex === -1 ? overItems.length : overIndex;

      return {
        ...prev,
        [activeStatus]: activeItems.filter((task) => task.id !== active.id),
        [overStatus]: [...overItems.slice(0, insertAt), { ...movingTask, status: overStatus }, ...overItems.slice(insertAt)],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTaskData = (tasks ?? []).find((task) => task.id === active.id);
    if (!activeTaskData) return;

    const activeStatus = findColumnOf(active.id);
    if (!activeStatus) return;
    const overStatus = isStatusId(over.id) ? over.id : (findColumnOf(over.id) ?? activeStatus);

    let workingColumns = columns;
    if (activeStatus === overStatus && !isStatusId(over.id)) {
      const items = columns[activeStatus];
      const oldIndex = items.findIndex((task) => task.id === active.id);
      const newIndex = items.findIndex((task) => task.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        workingColumns = { ...columns, [activeStatus]: arrayMove(items, oldIndex, newIndex) };
        setColumns(workingColumns);
      }
    }

    const targetList = workingColumns[overStatus];
    const targetIndex = targetList.findIndex((task) => task.id === active.id);
    const finalIndex = targetIndex === -1 ? targetList.length : targetIndex;
    const withoutActive = targetList.filter((task) => task.id !== active.id);

    if (needsRenormalization(withoutActive, finalIndex)) {
      const fullOrder = [...withoutActive.slice(0, finalIndex), activeTaskData, ...withoutActive.slice(finalIndex)];
      for (const { id, position } of renormalizedPositions(fullOrder)) {
        changeStatus.mutate({ taskId: id, status: overStatus, position });
      }
      return;
    }

    const position = computeDropPosition(withoutActive, finalIndex);
    if (activeTaskData.status === overStatus && activeTaskData.position === position) return;
    changeStatus.mutate({ taskId: activeTaskData.id, status: overStatus, position });
  }

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {STATUSES.map((status) => (
          <Skeleton key={status} className="h-64 w-72" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <EmptyState title="Couldn't load tasks" description={error instanceof Error ? error.message : 'Please try again.'} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={columns[status]}
            usersById={usersById}
            onTaskClick={(task) => navigate(taskDetailPath(projectId, task.id))}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <BoardTaskCard
            task={activeTask}
            assignee={activeTask.assigneeId ? (usersById.get(activeTask.assigneeId) ?? null) : null}
            onClick={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
