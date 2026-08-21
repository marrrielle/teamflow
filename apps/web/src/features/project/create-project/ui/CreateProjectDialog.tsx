import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, type CreateProjectRequest } from '@teamflow/contracts';
import { useCreateProjectMutation } from '@/entities/project';
import { Button, Dialog, FormField, Input } from '@/shared/ui';
import { useToast } from '@/shared/lib/toast';

const DEFAULT_COLOR = '#6366f1';

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const mutation = useCreateProjectMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectRequest>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { color: DEFAULT_COLOR },
  });

  async function onSubmit(values: CreateProjectRequest) {
    try {
      await mutation.mutateAsync(values);
      showToast('Project created', 'success');
      reset({ color: DEFAULT_COLOR });
      setOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to create project', 'error');
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New project</Button>
      <Dialog open={open} onOpenChange={setOpen} title="New project">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField label="Name" htmlFor="project-name" error={errors.name?.message}>
            <Input id="project-name" {...register('name')} autoFocus />
          </FormField>
          <FormField label="Description" htmlFor="project-description" error={errors.description?.message}>
            <Input id="project-description" {...register('description')} />
          </FormField>
          <FormField label="Color" htmlFor="project-color" error={errors.color?.message}>
            <input id="project-color" type="color" className="h-9 w-16 rounded border border-neutral-300 dark:border-neutral-700" {...register('color')} />
          </FormField>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending} className="self-end">
            Create
          </Button>
        </form>
      </Dialog>
    </>
  );
}
