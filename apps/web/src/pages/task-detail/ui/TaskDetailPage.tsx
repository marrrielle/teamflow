import { useNavigate } from 'react-router-dom';
import { taskStatusSchema, type ProjectId, type TaskId, type TaskStatus } from '@teamflow/contracts';
import { useTaskQuery, useUpdateTaskMutation, StatusBadge, PriorityBadge, isOverdueTask } from '@/entities/task';
import { EditTaskDialog } from '@/features/task/edit-task';
import { DeleteTaskButton } from '@/features/task/delete-task';
import { AssigneeSelect } from '@/features/task/assign-task';
import { useTypedParams } from '@/shared/lib/typed-params';
import { projectDetailPath } from '@/shared/config/routes';
import { Button, EmptyState, Skeleton } from '@/shared/ui';
import { useToast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/cn';

export function TaskDetailPage() {
  const { projectId, taskId } = useTypedParams<'/projects/:projectId/tasks/:taskId'>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: task, isLoading, isError, error } = useTaskQuery(taskId as TaskId);
  const updateStatus = useUpdateTaskMutation();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <EmptyState
        title="Couldn't load this task"
        description={error instanceof Error ? error.message : 'It may have been deleted.'}
      />
    );
  }

  async function handleStatusChange(status: TaskStatus) {
    try {
      await updateStatus.mutateAsync({ taskId: task!.id, body: { status } });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to change status', 'error');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" onClick={() => navigate(projectDetailPath(projectId as ProjectId))} className="self-start px-2">
        ← Back to project
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{task.title}</h1>
          {task.description ? <p className="mt-2 text-sm text-neutral-500">{task.description}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <EditTaskDialog task={task} />
          <DeleteTaskButton task={task} onDeleted={() => navigate(projectDetailPath(projectId as ProjectId))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800 sm:grid-cols-4">
        <div>
          <p className="text-xs text-neutral-500">Status</p>
          <div className="mt-1 flex gap-1">
            {taskStatusSchema.options.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => void handleStatusChange(status)}
                disabled={updateStatus.isPending}
                className={cn('rounded', status === task.status ? 'ring-2 ring-indigo-500' : 'opacity-60 hover:opacity-100')}
              >
                <StatusBadge status={status} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Priority</p>
          <div className="mt-1">
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Assignee</p>
          <div className="mt-1">
            <AssigneeSelect task={task} />
          </div>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Due date</p>
          <p className={cn('mt-1 text-sm', isOverdueTask(task) && 'font-medium text-red-600')}>
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
