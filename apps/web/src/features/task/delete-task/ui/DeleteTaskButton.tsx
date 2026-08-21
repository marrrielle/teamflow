import { useState } from 'react';
import type { Task } from '@teamflow/contracts';
import { useDeleteTaskMutation } from '@/entities/task';
import { Button, Dialog } from '@/shared/ui';
import { useToast } from '@/shared/lib/toast';

export function DeleteTaskButton({ task, onDeleted }: { task: Task; onDeleted?: () => void }) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const mutation = useDeleteTaskMutation();

  async function handleConfirm() {
    try {
      await mutation.mutateAsync(task.id);
      showToast('Task deleted', 'success');
      setOpen(false);
      onDeleted?.();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete task', 'error');
    }
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title="Delete task" description={`This permanently deletes "${task.title}". This cannot be undone.`}>
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
