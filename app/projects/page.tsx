'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { GlassCard, WipGauge, StatusBadge, LoadingPulse, SectionHeader } from '@/components/lifeos';
import type { Project, ProjectStatus, NotionListResponse } from '@/types/notion';

const WIP_LIMIT = 4;

const stagger = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

function statusVariant(status: ProjectStatus | string): 'cyan' | 'green' | 'orange' {
  if (status === 'Active') return 'cyan';
  if (status === 'Maintenance') return 'green';
  return 'orange';
}

function energyColor(level: string): string {
  if (level === 'Deep') return '#8b5cf6';
  if (level === 'Medium') return '#f59e0b';
  return '#10b981';
}

function groupByStatus(projects: Project[]): Record<string, Project[]> {
  const groups: Record<string, Project[]> = { Active: [], Maintenance: [], Parked: [] };
  for (const p of projects) {
    const key = p.status === 'Active' ? 'Active' : p.status === 'Maintenance' ? 'Maintenance' : 'Parked';
    groups[key].push(p);
  }
  return groups;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notion/projects');
        const json = (await res.json()) as NotionListResponse<Project>;
        if (json.error) setError(json.error);
        else setProjects(json.data);
      } catch {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <><LoadingPulse /></>;

  if (error) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassCard className="max-w-sm text-center">
            <p className="text-danger text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary text-sm mt-4">Retry</button>
          </GlassCard>
        </div>
      </>
    );
  }

  const activeCount = projects.filter((p) => p.status === 'Active').length;
  const groups = groupByStatus(projects);

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Header + WIP Gauge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Projects</h1>
              <p className="text-sm text-text-secondary mt-1">
                Manage your active work. WIP limit keeps you focused.
              </p>
            </div>
            <div className="w-full sm:w-56">
              <WipGauge active={activeCount} max={WIP_LIMIT} />
            </div>
          </div>
        </motion.div>

        {/* WIP warning */}
        {activeCount > WIP_LIMIT && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <GlassCard className="!border-danger/30 !bg-danger/5">
              <p className="text-sm text-danger font-medium">
                ⚠ You have {activeCount} active projects — {activeCount - WIP_LIMIT} over your WIP limit of {WIP_LIMIT}.
                Park something to regain focus.
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* Project groups */}
        {(['Active', 'Maintenance', 'Parked'] as const).map((status, gi) => {
          const items = groups[status];
          if (items.length === 0) return null;

          return (
            <motion.div
              key={status}
              custom={gi}
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="mb-8"
            >
              <SectionHeader
                icon={status === 'Active' ? '▦' : status === 'Maintenance' ? '⚙' : '◻'}
                title={status}
                subtitle={`${items.length} project${items.length !== 1 ? 's' : ''}`}
              />
              <div className="space-y-3">
                {items.map((project, i) => (
                  <motion.div key={project.id} custom={i} initial="hidden" animate="visible" variants={stagger}>
                    <GlassCard className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Name + next action */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-white truncate">{project.projectName}</p>
                          {project.tier && (
                            <StatusBadge label={`T${project.tier}`} variant="purple" />
                          )}
                        </div>
                        {project.nextAction && (
                          <p className="text-xs text-text-secondary truncate">Next: {project.nextAction}</p>
                        )}
                      </div>

                      {/* Meta badges */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {project.weeklyTimeCapHrs && (
                          <span className="text-[11px] text-text-secondary">{project.weeklyTimeCapHrs}h/wk</span>
                        )}
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: energyColor(project.energyLevel) }}
                          title={`Energy: ${project.energyLevel}`}
                        />
                        <StatusBadge label={status} variant={statusVariant(status)} />
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {projects.length === 0 && (
          <GlassCard className="text-center py-12">
            <p className="text-text-secondary text-sm">No projects found in Notion.</p>
          </GlassCard>
        )}
      </main>
    </>
  );
}
