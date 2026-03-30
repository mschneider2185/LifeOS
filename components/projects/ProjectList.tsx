'use client';

import { ProjectCard } from './ProjectCard';
import type { Project, ProjectStatus } from '@/types/lifeos';

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onArchive: (projectId: string) => void;
}

const statusGroups: { status: ProjectStatus; label: string }[] = [
  { status: 'active', label: 'Active' },
  { status: 'maintenance', label: 'Maintenance' },
  { status: 'parked', label: 'Parked' },
];

export function ProjectList({ projects, onEdit, onArchive }: ProjectListProps) {
  return (
    <div className="space-y-8">
      {statusGroups.map(({ status, label }) => {
        const group = projects.filter((p) => p.status === status);
        if (group.length === 0) return null;

        return (
          <section key={status} aria-label={`${label} projects`}>
            <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">
              {label} ({group.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={onEdit}
                  onArchive={onArchive}
                />
              ))}
            </div>
          </section>
        );
      })}

      {projects.length === 0 && (
        <div className="text-center py-16 text-text-secondary">
          <p className="text-lg mb-2">No projects yet</p>
          <p className="text-sm">Create your first project to get started.</p>
        </div>
      )}
    </div>
  );
}
