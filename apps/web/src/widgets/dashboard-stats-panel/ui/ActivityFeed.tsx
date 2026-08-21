import type { ActivityLog, User } from '@teamflow/contracts';
import { EmptyState } from '@/shared/ui';

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}

function describeActivity(activity: ActivityLog): string {
  const meta = activity.metadata as Record<string, unknown>;
  const title = typeof meta.title === 'string' ? meta.title : undefined;
  const name = typeof meta.name === 'string' ? meta.name : undefined;
  switch (activity.type) {
    case 'task_created':
      return `created task "${title ?? 'Untitled'}"`;
    case 'task_status_changed':
      return `moved "${title ?? 'a task'}" to ${String(meta.to ?? 'a new status')}`;
    case 'task_completed':
      return `completed "${title ?? 'a task'}"`;
    case 'task_assigned':
      return `reassigned "${title ?? 'a task'}"`;
    case 'task_deleted':
      return `deleted task "${title ?? 'a task'}"`;
    case 'project_created':
      return `created project "${name ?? 'Untitled'}"`;
    case 'project_updated':
      return `updated project "${name ?? 'a project'}"`;
    default:
      return activity.type;
  }
}

export function ActivityFeed({ activity, users }: { activity: readonly ActivityLog[]; users: readonly User[] }) {
  if (activity.length === 0) {
    return <EmptyState title="No activity yet" description="Actions on projects and tasks will show up here." />;
  }

  const usersById = new Map(users.map((user) => [user.id as string, user]));

  return (
    <ul className="flex flex-col gap-3">
      {activity.map((entry) => {
        const actor = usersById.get(entry.userId);
        return (
          <li key={entry.id} className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-neutral-700 dark:text-neutral-300">
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{actor?.name ?? 'Someone'}</span>{' '}
              {describeActivity(entry)}
            </span>
            <span className="shrink-0 text-xs text-neutral-500">{relativeTime(entry.createdAt)}</span>
          </li>
        );
      })}
    </ul>
  );
}
