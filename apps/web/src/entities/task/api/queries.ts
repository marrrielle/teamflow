import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  taskSchema,
  createTaskSchema,
  updateTaskSchema,
  type Task,
  type TaskId,
  type ProjectId,
  type TaskFilters,
  type CreateTaskRequest,
  type UpdateTaskRequest,
} from '@teamflow/contracts';
import { apiClient } from '@/shared/api/client';

const TASK_KEYS_ROOT = ['tasks'] as const;

interface TaskKeys {
  all: readonly ['tasks'];
  list: (projectId: ProjectId, filters: TaskFilters) => readonly ['tasks', 'list', ProjectId, TaskFilters];
  detail: (id: TaskId) => readonly ['tasks', 'detail', TaskId];
}

export const taskKeys = {
  all: TASK_KEYS_ROOT,
  list: (projectId, filters) => [...TASK_KEYS_ROOT, 'list', projectId, filters] as const,
  detail: (id) => [...TASK_KEYS_ROOT, 'detail', id] as const,
} satisfies TaskKeys;

export function useTasksQuery(projectId: ProjectId, filters: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(projectId, filters),
    queryFn: async (): Promise<Task[]> => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) query.set(key, String(value));
      }
      const qs = query.toString();
      const res = await apiClient.get<Task[]>(`/projects/${projectId}/tasks${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error(res.error.message);
      return z.array(taskSchema).parse(res.data);
    },
  });
}

export function useTaskQuery(taskId: TaskId | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(taskId as TaskId),
    queryFn: async (): Promise<Task> => {
      const res = await apiClient.get<Task>(`/tasks/${taskId}`);
      if (!res.ok) throw new Error(res.error.message);
      return taskSchema.parse(res.data);
    },
    enabled: Boolean(taskId),
  });
}

export function useCreateTaskMutation(projectId: ProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateTaskRequest): Promise<Task> => {
      const payload = createTaskSchema.parse(body);
      const res = await apiClient.post<CreateTaskRequest, Task>(`/projects/${projectId}/tasks`, payload);
      if (!res.ok) throw new Error(res.error.message);
      return taskSchema.parse(res.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TASK_KEYS_ROOT });
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, body }: { taskId: TaskId; body: UpdateTaskRequest }): Promise<Task> => {
      const payload = updateTaskSchema.parse(body);
      const res = await apiClient.patch<UpdateTaskRequest, Task>(`/tasks/${taskId}`, payload);
      if (!res.ok) throw new Error(res.error.message);
      return taskSchema.parse(res.data);
    },
    onSuccess: (task) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
      void queryClient.invalidateQueries({ queryKey: TASK_KEYS_ROOT });
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: TaskId): Promise<void> => {
      const res = await apiClient.delete<void>(`/tasks/${taskId}`);
      if (!res.ok) throw new Error(res.error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TASK_KEYS_ROOT });
    },
  });
}
