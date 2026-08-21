import { Link } from 'react-router-dom';
import { useProjectsQuery } from '@/entities/project';
import { CreateProjectDialog } from '@/features/project/create-project';
import { ProjectCard } from '@/entities/project';
import { EmptyState, Skeleton } from '@/shared/ui';
import { projectDetailPath } from '@/shared/config/routes';

export function ProjectsListPage() {
  const { data: projects, isLoading, isError, error } = useProjectsQuery();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <CreateProjectDialog />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-24" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load projects" description={error instanceof Error ? error.message : 'Please try again.'} />
      ) : !projects || projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Create your first project to start tracking tasks." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} to={projectDetailPath(project.id)}>
              <ProjectCard project={project} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
