import { fetchProjects } from './fetch-projects';
import { CustomLink } from '@/components/ui/custom-link';
import { Badge } from '@/components/ui/badge';

export default async function ProjectsPage() {
  const projects = [...(await fetchProjects())].sort(
    (a, b) => a.priority - b.priority
  );

  return (
    <div className='flex flex-col gap-6'>
      <h1>Projects</h1>
      <div className='flex flex-col gap-6'>
        {projects.map((project) => (
          <div key={project.id} className='flex flex-col gap-2'>
            <div className='flex flex-row justify-between items-center'>
              <CustomLink href={project.url}>
                <h2>{project.name}</h2>
              </CustomLink>
              <span>{project.year}</span>
            </div>
            <p>{project.description}</p>
            {project.tags && (
              <div className='flex flex-row gap-2 flex-wrap'>
                {project.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className='pointer-events-none rounded-full border-border'
                    variant='secondary'
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
