import type { Task, UserId } from '@teamflow/contracts';
import { useUpdateTaskMutation } from '@/entities/task';
import { useUsersQuery } from '@/entities/user';
import { Select } from '@/shared/ui';
import { useToast } from '@/shared/lib/toast';

export function AssigneeSelect({ task }: { task: Task }) {
  const { data: users } = useUsersQuery();
  const mutation = useUpdateTaskMutation();
  const { showToast } = useToast();

  async function handleChange(value: string) {
    try {
      await mutation.mutateAsync({ taskId: task.id, body: { assigneeId: (value || null) as UserId | null } });
      showToast('Assignee updated', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to reassign task', 'error');
    }
  }

  return (
    <Select
      aria-label="Assignee"
      value={task.assigneeId ?? ''}
      disabled={mutation.isPending}
      onChange={(event) => void handleChange(event.target.value)}
      className="w-auto"
    >
      <option value="">Unassigned</option>
      {users?.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}
        </option>
      ))}
    </Select>
  );
}
