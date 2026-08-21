import type { ProjectId, TaskId } from '@teamflow/contracts';

export const ROUTES = {
  login: '/login',
  dashboard: '/',
  projects: '/projects',
  projectDetail: '/projects/:projectId',
  taskDetail: '/projects/:projectId/tasks/:taskId',
  notFound: '*',
} as const satisfies Record<string, string>;

export function projectDetailPath(projectId: ProjectId): string {
  return `/projects/${projectId}`;
}

export function taskDetailPath(projectId: ProjectId, taskId: TaskId): string {
  return `/projects/${projectId}/tasks/${taskId}`;
}
