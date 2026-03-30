'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { WipGauge } from '@/components/projects/WipGauge';
import type { Project, ProjectTier } from '@/types/lifeos';

interface ProjectsPanelProps {
  projects: Project[];
  wipLimit: number;
}

const tierColor: Record<ProjectTier, string> = {
  1: 'text-cyan-accent',
  2: 'text-purple-accent',
  3: 'text-text-secondary',
};

export function ProjectsPanel({ projects, wipLimit }: ProjectsPanelProps) {
  const activeCount = projects.length;

  if (projects.length === 0) {
    return (
      <GlassCard className="flex flex-col items-center justify-center text-center min-h-[200px]">
        <p className="text-text-secondary mb-3">Add your first project to get started</p>
        <Link href="/projects" className="btn-primary text-sm !py-2 !px-4">
          + Add Project
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold tracking-tight text-white">Projects</h2>
        <Link href="/projects" className="text-xs text-cyan-accent hover:text-cyan-accent/80 transition-colors">
          View all
        </Link>
      </div>

      <div className="flex justify-center">
        <WipGauge activeCount={activeCount} wipLimit={wipLimit} />
      </div>

      <ul className="space-y-2">
        {projects.slice(0, 6).map((project) => (
          <li key={project.id}>
            <Link
              href="/projects"
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <span className={`text-xs font-medium ${tierColor[project.tier]}`}>
                T{project.tier}
              </span>
              <span className="text-sm text-white truncate flex-1 group-hover:text-cyan-accent transition-colors">
                {project.name}
              </span>
              {/* Mini progress bar */}
              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full bg-cyan-accent"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-xs text-text-secondary w-8 text-right">
                {project.progress}%
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
