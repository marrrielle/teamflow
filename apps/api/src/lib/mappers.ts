import type { users, projects, tasks, activityLog } from '../db/schema';
import type { User, Project, Task, ActivityLog, UserId, ProjectId, TaskId } from '@teamflow/contracts';

type UserRow = typeof users.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;
type TaskRow = typeof tasks.$inferSelect;
type ActivityRow = typeof activityLog.$inferSelect;

export function toUserDto(row: UserRow): User {
  return {
    id: row.id as UserId,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toProjectDto(row: ProjectRow): Project {
  return {
    id: row.id as ProjectId,
    name: row.name,
    description: row.description,
    color: row.color,
    ownerId: row.ownerId as UserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toTaskDto(row: TaskRow): Task {
  return {
    id: row.id as TaskId,
    projectId: row.projectId as ProjectId,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assigneeId as UserId | null,
    dueDate: row.dueDate ? row.dueDate.toISOString() : null,
    position: row.position,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toActivityDto(row: ActivityRow): ActivityLog {
  return {
    id: row.id,
    type: row.type,
    entityType: row.entityType,
    entityId: row.entityId,
    userId: row.userId as UserId,
    metadata: row.metadata as Record<string, unknown>,
    createdAt: row.createdAt.toISOString(),
  };
}
