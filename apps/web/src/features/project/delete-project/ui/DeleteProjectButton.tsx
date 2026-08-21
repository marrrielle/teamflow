import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@teamflow/contracts';
import { useDeleteProjectMutation } from '@/entities/project';
import { Button, Dialog } from '@/shared/ui';
import { useToast } from '@/shared/lib/toast';
import { ROUTES } from '@/shared/config/routes';

export function DeleteProjectButton({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const mutation = useDeleteProjectMutation();

  async function handleConfirm() {
    try {
      await mutation.mutateAsync(project.id);
      showToast('Project deleted', 'success');
      setOpen(false);
      navigate(ROUTES.projects);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete project', 'error');
    }
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Delete project"
        description={`This permanently deletes "${project.name}" and all of its tasks. This cannot be undone.`}
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={mutation.isPending} onClick={handleConfirm}>
            Delete
          </Button>
        </div>
      </Dialog>
    </>
  );
}
