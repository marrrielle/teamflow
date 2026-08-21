import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateTaskSchema, taskPrioritySchema, type Task, type UpdateTaskRequest, type UserId } from '@teamflow/contracts';
import { useUpdateTaskMutation } from '@/entities/task';
import { useUsersQuery } from '@/entities/user';
import { Button, Dialog, FormField, Input, Select } from '@/shared/ui';
import { useToast } from '@/shared/lib/toast';

const editTaskFormSchema = updateTaskSchema
  .omit({ status: true, position: true })
  .extend({ dueDate: z.string().optional(), assigneeId: z.string().optional() });
type EditTaskFormValues = z.infer<typeof editTaskFormSchema>;

function toDateInputValue(dueDate: string | null): string {
  return dueDate ? dueDate.slice(0, 10) : '';
}

export function EditTaskDialog({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const mutation = useUpdateTaskMutation();
  const { data: users } = useUsersQuery();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      priority: task.priority,
      assigneeId: task.assigneeId ?? '',
      dueDate: toDateInputValue(task.dueDate),
    },
  });

  async function onSubmit(values: EditTaskFormValues) {
    const body: UpdateTaskRequest = {
      ...values,
      assigneeId: (values.assigneeId || null) as UserId | null,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
    };
    try {
      await mutation.mutateAsync({ taskId: task.id, body });
      showToast('Task updated', 'success');
      setOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update task', 'error');
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title="Edit task">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField label="Title" htmlFor="edit-task-title" error={errors.title?.message}>
            <Input id="edit-task-title" {...register('title')} autoFocus />
          </FormField>
          <FormField label="Description" htmlFor="edit-task-description" error={errors.description?.message}>
            <Input id="edit-task-description" {...register('description')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Priority" htmlFor="edit-task-priority" error={errors.priority?.message}>
              <Select id="edit-task-priority" {...register('priority')}>
                {taskPrioritySchema.options.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Due date" htmlFor="edit-task-due-date" error={errors.dueDate?.message}>
              <Input id="edit-task-due-date" type="date" {...register('dueDate')} />
            </FormField>
          </div>
          <FormField label="Assignee" htmlFor="edit-task-assignee" error={errors.assigneeId?.message}>
            <Select id="edit-task-assignee" {...register('assigneeId')}>
              <option value="">Unassigned</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </FormField>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending} className="self-end">
            Save
          </Button>
        </form>
      </Dialog>
    </>
  );
}
