import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProjectSchema, type Project, type UpdateProjectRequest } from '@teamflow/contracts';
import { useUpdateProjectMutation } from '@/entities/project';
import { Button, Dialog, FormField, Input } from '@/shared/ui';
import { useToast } from '@/shared/lib/toast';

export function EditProjectDialog({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const mutation = useUpdateProjectMutation(project.id);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProjectRequest>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: { name: project.name, description: project.description, color: project.color },
  });

  async function onSubmit(values: UpdateProjectRequest) {
    try {
      await mutation.mutateAsync(values);
      showToast('Project updated', 'success');
      setOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update project', 'error');
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title="Edit project">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField label="Name" htmlFor="edit-project-name" error={errors.name?.message}>
            <Input id="edit-project-name" {...register('name')} autoFocus />
          </FormField>
          <FormField label="Description" htmlFor="edit-project-description" error={errors.description?.message}>
            <Input id="edit-project-description" {...register('description')} />
          </FormField>
          <FormField label="Color" htmlFor="edit-project-color" error={errors.color?.message}>
            <input
              id="edit-project-color"
              type="color"
              className="h-9 w-16 rounded border border-neutral-300 dark:border-neutral-700"
              {...register('color')}
            />
          </FormField>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending} className="self-end">
            Save
          </Button>
        </form>
      </Dialog>
    </>
  );
}
