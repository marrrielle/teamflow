import { useNavigate } from 'react-router-dom';
import type { ProjectId, Task, TaskFilters } from '@teamflow/contracts';
import { useTasksQuery, StatusBadge, PriorityBadge, Avatar, isOverdueTask } from '@/entities/task';
import { useUsersQuery } from '@/entities/user';
import { taskDetailPath } from '@/shared/config/routes';
import { DataTable, EmptyState, Skeleton, type DataTableColumn } from '@/shared/ui';

export function TaskListView({ projectId, filters }: { projectId: ProjectId; filters: TaskFilters }) {
  const navigate = useNavigate();
  const { data: tasks, isLoading, isError, error } = useTasksQuery(projectId, filters);
  const { data: users } = useUsersQuery();
  const usersById = new Map((users ?? []).map((user) => [user.id as string, user]));

  const columns = [
    { id: 'title', header: 'Title', accessor: (task) => task.title },
    { id: 'status', header: 'Status', accessor: (task) => <StatusBadge status={task.status} /> },
    { id: 'priority', header: 'Priority', accessor: (task) => <PriorityBadge priority={task.priority} /> },
    {
      id: 'assignee',
      header: 'Assignee',
      accessor: (task) => <Avatar user={task.assigneeId ? (usersById.get(task.assigneeId) ?? null) : null} />,
    },
    {
      id: 'dueDate',
      header: 'Due',
      accessor: (task) =>
        task.dueDate ? (
          <span className={isOverdueTask(task) ? 'font-medium text-red-600' : undefined}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
  ] as const satisfies readonly DataTableColumn<Task>[];

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (isError) {
    return <EmptyState title="Couldn't load tasks" description={error instanceof Error ? error.message : 'Please try again.'} />;
  }

  return (
    <DataTable
      data={tasks ?? []}
      columns={columns}
      getRowId={(task) => task.id}
      onRowClick={(task) => navigate(taskDetailPath(projectId, task.id))}
      emptyState={
        <EmptyState
          title={Object.keys(filters).length > 0 ? 'No tasks match your filters' : 'No tasks yet'}
          description={Object.keys(filters).length > 0 ? 'Try widening your search or clearing filters.' : 'Create the first task for this project.'}
        />
      }
    />
  );
}
