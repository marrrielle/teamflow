import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTaskSchema, taskPrioritySchema, type CreateTaskRequest, type ProjectId, type UserId } from '@teamflow/contracts';
import { useCreateTaskMutation } from '@/entities/task';
import { useUsersQuery } from '@/entities/user';
import { Button, Dialog, FormField, Input, Select } from '@/shared/ui';
import { useToast } from '@/shared/lib/toast';

// HTML <input type="date"> yields "YYYY-MM-DD" (not a full ISO datetime), and the
// "Unassigned" <select> option yields "" (not a branded UserId or null/undefined) —
// neither matches the wire schema's shape directly. Everything else — title length,
// priority enum, description limits — still validates straight off createTaskSchema,
// so it can never drift from the backend; only these two fields' native-HTML shapes
// are relaxed here, then converted to the canonical wire shape in onSubmit before the
// payload is re-validated against createTaskSchema (unchanged) in useCreateTaskMutation.
const createTaskFormSchema = createTaskSchema.extend({ dueDate: z.string().optional(), assigneeId: z.string().optional() });
type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>;

export function CreateTaskDialog({ projectId }: { projectId: ProjectId }) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const mutation = useCreateTaskMutation(projectId);
  const { data: users } = useUsersQuery();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: { priority: 'medium' },
  });

  async function onSubmit(values: CreateTaskFormValues) {
    const payload: CreateTaskRequest = {
      ...values,
      assigneeId: (values.assigneeId || null) as UserId | null,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
    };
    try {
      await mutation.mutateAsync(payload);
      showToast('Task created', 'success');
      reset({ priority: 'medium' });
      setOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to create task', 'error');
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New task</Button>
      <Dialog open={open} onOpenChange={setOpen} title="New task">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField label="Title" htmlFor="task-title" error={errors.title?.message}>
            <Input id="task-title" {...register('title')} autoFocus />
          </FormField>
          <FormField label="Description" htmlFor="task-description" error={errors.description?.message}>
            <Input id="task-description" {...register('description')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Priority" htmlFor="task-priority" error={errors.priority?.message}>
              <Select id="task-priority" {...register('priority')}>
                {taskPrioritySchema.options.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Due date" htmlFor="task-due-date" error={errors.dueDate?.message}>
              <Input id="task-due-date" type="date" {...register('dueDate')} />
            </FormField>
          </div>
          <FormField label="Assignee" htmlFor="task-assignee" error={errors.assigneeId?.message}>
            <Select id="task-assignee" {...register('assigneeId')}>
              <option value="">Unassigned</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </FormField>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending} className="self-end">
            Create
          </Button>
        </form>
      </Dialog>
    </>
  );
}
