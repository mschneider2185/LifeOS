'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project, ProjectTier, ProjectStatus, EnergyLevel } from '@/types/lifeos';

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

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
  project?: Project | null;
  canAddActive: boolean;
  activeCount: number;
  wipLimit: number;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  project,
  canAddActive,
  activeCount,
  wipLimit,
}: ProjectModalProps) {
  const isEditing = !!project;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      tier: 2,
      status: 'active',
      energy_level: 'medium',
      weekly_hours_cap: null,
      next_action: '',
      progress: 0,
      notes: '',
    },
  });

  const selectedStatus = watch('status');
  const isActiveBlocked = !canAddActive && selectedStatus === 'active' && !isEditing;
  const wasAlreadyActive = isEditing && project?.status === 'active';

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description ?? '',
        tier: project.tier,
        status: project.status,
        energy_level: project.energy_level,
        weekly_hours_cap: project.weekly_hours_cap,
        next_action: project.next_action ?? '',
        progress: project.progress,
        notes: project.notes ?? '',
      });
    } else {
      reset({
        name: '',
        description: '',
        tier: 2,
        status: canAddActive ? 'active' : 'parked',
        energy_level: 'medium',
        weekly_hours_cap: null,
        next_action: '',
        progress: 0,
        notes: '',
      });
    }
  }, [project, canAddActive, reset]);

  const handleFormSubmit = (data: ProjectFormData) => {
    if (!canAddActive && data.status === 'active' && !wasAlreadyActive) {
      return;
    }
    onSubmit(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close modal"
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card custom-scrollbar"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={isEditing ? `Edit ${project?.name}` : 'Create project'}
          >
            <h2 className="text-lg font-semibold tracking-tight text-white mb-4">
              {isEditing ? 'Edit Project' : 'New Project'}
            </h2>

            {/* WIP warning */}
            {!canAddActive && !wasAlreadyActive && (
              <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm">
                You have {activeCount}/{wipLimit} active projects. Park or complete one to add another active project.
              </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="project-name" className="block text-sm text-text-secondary mb-1">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  id="project-name"
                  {...register('name', { required: 'Project name is required' })}
                  className="input-field"
                  placeholder="Project name"
                />
                {errors.name && (
                  <p className="text-danger text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="project-description" className="block text-sm text-text-secondary mb-1">
                  Description
                </label>
                <textarea
                  id="project-description"
                  {...register('description')}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Brief description (optional)"
                />
              </div>

              {/* Tier + Status row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="project-tier" className="block text-sm text-text-secondary mb-1">
                    Tier
                  </label>
                  <select
                    id="project-tier"
                    {...register('tier', { valueAsNumber: true })}
                    className="input-field"
                  >
                    <option value={1}>T1 - Core</option>
                    <option value={2}>T2 - Important</option>
                    <option value={3}>T3 - Nice to have</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="project-status" className="block text-sm text-text-secondary mb-1">
                    Status
                  </label>
                  <select
                    id="project-status"
                    {...register('status')}
                    className="input-field"
                  >
                    <option value="active" disabled={isActiveBlocked}>
                      Active {isActiveBlocked ? '(at limit)' : ''}
                    </option>
                    <option value="maintenance">Maintenance</option>
                    <option value="parked">Parked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Energy + Hours row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="project-energy" className="block text-sm text-text-secondary mb-1">
                    Energy Level
                  </label>
                  <select
                    id="project-energy"
                    {...register('energy_level')}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="deep">Deep Focus</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="project-hours" className="block text-sm text-text-secondary mb-1">
                    Weekly Hours Cap
                  </label>
                  <input
                    id="project-hours"
                    type="number"
                    {...register('weekly_hours_cap', { valueAsNumber: true })}
                    className="input-field"
                    placeholder="Optional"
                    min={0}
                    max={80}
                  />
                </div>
              </div>

              {/* Next action */}
              <div>
                <label htmlFor="project-next-action" className="block text-sm text-text-secondary mb-1">
                  Next Action
                </label>
                <input
                  id="project-next-action"
                  {...register('next_action')}
                  className="input-field"
                  placeholder="What's the very next step?"
                />
              </div>

              {/* Progress */}
              <div>
                <label htmlFor="project-progress" className="block text-sm text-text-secondary mb-1">
                  Progress: {watch('progress')}%
                </label>
                <input
                  id="project-progress"
                  type="range"
                  {...register('progress', { valueAsNumber: true })}
                  className="w-full accent-cyan-accent"
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="project-notes" className="block text-sm text-text-secondary mb-1">
                  Notes
                </label>
                <textarea
                  id="project-notes"
                  {...register('notes')}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Any notes (optional)"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-sm !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActiveBlocked}
                  className="btn-primary text-sm !py-2 !px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isEditing ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
