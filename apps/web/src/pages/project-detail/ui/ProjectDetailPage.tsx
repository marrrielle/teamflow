import { useState } from 'react';
import { taskFiltersSchema } from '@teamflow/contracts';
import type { ProjectId } from '@teamflow/contracts';
import { useProjectQuery } from '@/entities/project';
import { ProjectHeader } from '@/widgets/project-header';
import { TaskFiltersBar } from '@/widgets/task-filters-bar';
import { TaskBoard } from '@/widgets/task-board';
import { CreateTaskDialog } from '@/features/task/create-task';
import { useTypedParams } from '@/shared/lib/typed-params';
import { useSearchParamsState } from '@/shared/lib/use-search-params-state';
import { EmptyState, Skeleton } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { TaskListView } from './TaskListView';

type BoardView = 'board' | 'list';

export function ProjectDetailPage() {
  const { projectId } = useTypedParams<'/projects/:projectId'>();
  const { data: project, isLoading, isError, error } = useProjectQuery(projectId as ProjectId);
  const [filters] = useSearchParamsState(taskFiltersSchema);
  const [view, setView] = useState<BoardView>('board');

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <EmptyState
        title="Couldn't load this project"
        description={error instanceof Error ? error.message : 'It may have been deleted, or you may not have access.'}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ProjectHeader project={project} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <TaskFiltersBar showSort={view === 'list'} />
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-neutral-300 p-0.5 dark:border-neutral-700">
            {(['board', 'list'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                className={cn(
                  'rounded px-3 py-1 text-sm capitalize',
                  view === option
                    ? 'bg-indigo-600 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <CreateTaskDialog projectId={project.id} />
        </div>
      </div>

      {view === 'board' ? (
        <TaskBoard projectId={project.id} filters={filters} />
      ) : (
        <TaskListView projectId={project.id} filters={filters} />
      )}
    </div>
  );
}
