import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  projectSchema,
  createProjectSchema,
  updateProjectSchema,
  type Project,
  type ProjectId,
  type CreateProjectRequest,
  type UpdateProjectRequest,
} from '@teamflow/contracts';
import { apiClient } from '@/shared/api/client';

const PROJECT_KEYS_ROOT = ['projects'] as const;

interface ProjectKeys {
  all: readonly ['projects'];
  list: () => readonly ['projects', 'list'];
  detail: (id: ProjectId) => readonly ['projects', 'detail', ProjectId];
}

export const projectKeys = {
  all: PROJECT_KEYS_ROOT,
  list: () => [...PROJECT_KEYS_ROOT, 'list'] as const,
  detail: (id: ProjectId) => [...PROJECT_KEYS_ROOT, 'detail', id] as const,
} satisfies ProjectKeys;

export function useProjectsQuery() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: async (): Promise<Project[]> => {
      const res = await apiClient.get<Project[]>('/projects');
      if (!res.ok) throw new Error(res.error.message);
      return z.array(projectSchema).parse(res.data);
    },
  });
}

export function useProjectQuery(projectId: ProjectId | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId as ProjectId),
    queryFn: async (): Promise<Project> => {
      const res = await apiClient.get<Project>(`/projects/${projectId}`);
      if (!res.ok) throw new Error(res.error.message);
      return projectSchema.parse(res.data);
    },
    enabled: Boolean(projectId),
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateProjectRequest): Promise<Project> => {
      const payload = createProjectSchema.parse(body);
      const res = await apiClient.post<CreateProjectRequest, Project>('/projects', payload);
      if (!res.ok) throw new Error(res.error.message);
      return projectSchema.parse(res.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}

export function useUpdateProjectMutation(projectId: ProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateProjectRequest): Promise<Project> => {
      const payload = updateProjectSchema.parse(body);
      const res = await apiClient.patch<UpdateProjectRequest, Project>(`/projects/${projectId}`, payload);
      if (!res.ok) throw new Error(res.error.message);
      return projectSchema.parse(res.data);
    },
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(projectId), project);
      void queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: ProjectId): Promise<void> => {
      const res = await apiClient.delete<void>(`/projects/${projectId}`);
      if (!res.ok) throw new Error(res.error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}
