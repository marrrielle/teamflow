import type { Project } from '@teamflow/contracts';
import { EditProjectDialog } from '@/features/project/edit-project';
import { DeleteProjectButton } from '@/features/project/delete-project';

export function ProjectHeader({ project }: { project: Project }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <span aria-hidden className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{project.name}</h1>
          {project.description ? <p className="mt-1 text-sm text-neutral-500">{project.description}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <EditProjectDialog project={project} />
        <DeleteProjectButton project={project} />
      </div>
    </div>
  );
}
