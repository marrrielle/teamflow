import type { Project } from '@teamflow/contracts';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700">
      <div className="flex items-center gap-2">
        <span aria-hidden className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
        <h3 className="truncate font-medium text-neutral-900 dark:text-neutral-100">{project.name}</h3>
      </div>
      {project.description ? (
        <p className="line-clamp-2 text-sm text-neutral-500">{project.description}</p>
      ) : (
        <p className="text-sm italic text-neutral-400">No description</p>
      )}
    </div>
  );
}
