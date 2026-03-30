'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import type { Project, ProjectTier, ProjectStatus, EnergyLevel } from '@/types/lifeos';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onArchive: (projectId: string) => void;
}

const tierConfig: Record<ProjectTier, { label: string; color: string }> = {
  1: { label: 'T1', color: 'bg-cyan-accent/20 text-cyan-accent border-cyan-accent/30' },
  2: { label: 'T2', color: 'bg-purple-accent/20 text-purple-accent border-purple-accent/30' },
  3: { label: 'T3', color: 'bg-white/10 text-text-secondary border-white/20' },
};

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-success/20 text-success' },
  maintenance: { label: 'Maintenance', color: 'bg-warning/20 text-warning' },
  parked: { label: 'Parked', color: 'bg-white/10 text-text-secondary' },
  completed: { label: 'Completed', color: 'bg-cyan-accent/20 text-cyan-accent' },
  archived: { label: 'Archived', color: 'bg-white/5 text-text-secondary' },
};

const energyEmoji: Record<EnergyLevel, string> = {
  deep: '\uD83D\uDD25',
  high: '\u26A1',
  medium: '\uD83D\uDCA1',
  low: '\uD83C\uDF19',
};

export function ProjectCard({ project, onEdit, onArchive }: ProjectCardProps) {
  const tier = tierConfig[project.tier];
  const status = statusConfig[project.status];
  const energy = energyEmoji[project.energy_level];

  return (
    <GlassCard className="flex flex-col gap-3">
      {/* Header: name + badges */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold tracking-tight text-white truncate flex-1">
          {project.name}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tier.color}`}
          >
            {tier.label}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Energy level */}
      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
        <span aria-label={`Energy: ${project.energy_level}`}>{energy}</span>
        <span className="capitalize">{project.energy_level} energy</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-text-secondary">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan-accent transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Next action */}
      {project.next_action && (
        <p className="text-sm text-text-secondary truncate">
          <span className="text-white/40">Next:</span> {project.next_action}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-glass-border mt-auto">
        <button
          onClick={() => onEdit(project)}
          className="text-xs text-cyan-accent hover:text-cyan-accent/80 transition-colors px-2 py-1 rounded hover:bg-white/5"
          aria-label={`Edit ${project.name}`}
        >
          Edit
        </button>
        {project.status !== 'archived' && (
          <button
            onClick={() => onArchive(project.id)}
            className="text-xs text-text-secondary hover:text-danger transition-colors px-2 py-1 rounded hover:bg-white/5"
            aria-label={`Archive ${project.name}`}
          >
            Archive
          </button>
        )}
      </div>
    </GlassCard>
  );
}
