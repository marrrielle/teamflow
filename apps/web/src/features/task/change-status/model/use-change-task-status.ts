import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTaskSchema, taskSchema, type Task, type TaskId, type TaskStatus, type ProjectId, type TaskFilters } from '@teamflow/contracts';
import { apiClient } from '@/shared/api/client';
import { taskKeys } from '@/entities/task';
import { useToast } from '@/shared/lib/toast';

interface ChangeStatusVariables {
  taskId: TaskId;
  status: TaskStatus;
  position: number;
}

/**
 * Optimistic status+position update for kanban drag & drop: the cache is updated
 * immediately in onMutate (so the card doesn't snap back while the request is in
 * flight), rolled back to the pre-drag snapshot in onError, and reconciled with the
 * server in onSettled. Lives in this feature (not entities/task) because the
 * optimistic-DnD orchestration is feature-specific business logic, not base CRUD.
 */
export function useChangeTaskStatus(projectId: ProjectId, filters: TaskFilters) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const listKey = taskKeys.list(projectId, filters);

  return useMutation({
    mutationFn: async ({ taskId, status, position }: ChangeStatusVariables): Promise<Task> => {
      const payload = updateTaskSchema.parse({ status, position });
      const res = await apiClient.patch<typeof payload, Task>(`/tasks/${taskId}`, payload);
      if (!res.ok) throw new Error(res.error.message);
      return taskSchema.parse(res.data);
    },
    onMutate: async ({ taskId, status, position }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<Task[]>(listKey);
      queryClient.setQueryData<Task[]>(listKey, (old) =>
        old?.map((task) => (task.id === taskId ? { ...task, status, position } : task)),
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
      showToast(error instanceof Error ? error.message : 'Failed to move task', 'error');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
