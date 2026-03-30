'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AppShell } from '@/components/nav/AppShell';
import { WipGauge } from '@/components/projects/WipGauge';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectModal } from '@/components/projects/ProjectModal';
import type { Project, ProjectTier, ProjectStatus, EnergyLevel } from '@/types/lifeos';
import toast from 'react-hot-toast';

interface ProjectFormData {
  name: string;
  description: string;
  tier: ProjectTier;
  status: ProjectStatus;
  energy_level: EnergyLevel;
  weekly_hours_cap: number | null;
  next_action: string;
  progress: number;
  notes: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [wipLimit, setWipLimit] = useState(4);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const canAddActive = activeCount < wipLimit;

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [projectsRes, profileRes] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true }),
      supabase
        .from('personality_profiles')
        .select('wip_limit')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

    if (projectsRes.data) {
      setProjects(projectsRes.data as Project[]);
    }
    if (profileRes.data?.wip_limit) {
      setWipLimit(profileRes.data.wip_limit);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (data: ProjectFormData) => {
    if (!userId) return;

    const maxOrder = projects.reduce((max, p) => Math.max(max, p.sort_order), 0);

    const { error } = await supabase.from('projects').insert({
      user_id: userId,
      name: data.name,
      description: data.description || null,
      tier: data.tier,
      status: data.status,
      energy_level: data.energy_level,
      weekly_hours_cap: data.weekly_hours_cap || null,
      next_action: data.next_action || null,
      progress: data.progress,
      notes: data.notes || null,
      sort_order: maxOrder + 1,
    });

    if (error) {
      toast.error('Failed to create project');
      return;
    }

    toast.success('Project created');
    setModalOpen(false);
    fetchData();
  };

  const handleUpdate = async (data: ProjectFormData) => {
    if (!editingProject) return;

    const { error } = await supabase
      .from('projects')
      .update({
        name: data.name,
        description: data.description || null,
        tier: data.tier,
        status: data.status,
        energy_level: data.energy_level,
        weekly_hours_cap: data.weekly_hours_cap || null,
        next_action: data.next_action || null,
        progress: data.progress,
        notes: data.notes || null,
      })
      .eq('id', editingProject.id);

    if (error) {
      toast.error('Failed to update project');
      return;
    }

    toast.success('Project updated');
    setEditingProject(null);
    setModalOpen(false);
    fetchData();
  };

  const handleArchive = async (projectId: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ status: 'archived' as ProjectStatus })
      .eq('id', projectId);

    if (error) {
      toast.error('Failed to archive project');
      return;
    }

    toast.success('Project archived');
    fetchData();
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleModalSubmit = (data: ProjectFormData) => {
    if (editingProject) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  if (loading) {
    return (
      <AppShell>
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="spinner h-8 w-8" />
      </div>
      </AppShell>
    );
  }

  // Filter out archived for the main list
  const visibleProjects = projects.filter((p) => p.status !== 'archived');

  return (
    <AppShell>
    <main className="min-h-screen bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Projects</h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage your active work. Your WIP limit keeps you focused.
            </p>
          </div>
          <WipGauge activeCount={activeCount} wipLimit={wipLimit} />
        </div>

        {/* Add project button */}
        <div className="mb-6">
          <button
            onClick={openCreateModal}
            className="btn-primary text-sm !py-2.5 !px-5"
            aria-label="Add new project"
          >
            + Add Project
          </button>
          {!canAddActive && (
            <p className="text-xs text-warning mt-2">
              WIP limit reached ({activeCount}/{wipLimit}). New projects will default to Parked.
            </p>
          )}
        </div>

        {/* Project list */}
        <ProjectList
          projects={visibleProjects}
          onEdit={openEditModal}
          onArchive={handleArchive}
        />

        {/* Modal */}
        <ProjectModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingProject(null);
          }}
          onSubmit={handleModalSubmit}
          project={editingProject}
          canAddActive={canAddActive}
          activeCount={activeCount}
          wipLimit={wipLimit}
        />
      </div>
    </main>
    </AppShell>
  );
}
