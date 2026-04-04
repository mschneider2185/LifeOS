import {
  LayoutDashboard,
  Zap,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  Target,
  Heart,
  DollarSign,
} from 'lucide-react'

// ============================================================
// Navigation
// ============================================================

export const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { id: 'braindump', icon: Zap, label: 'Brain Dump', href: '/brain-dump' },
  { id: 'checkin', icon: CheckCircle2, label: 'Check-in', href: '/checkin' },
  { id: 'projects', icon: FolderKanban, label: 'Projects', href: '/projects' },
  { id: 'tasks', icon: ListTodo, label: 'Tasks', href: '/tasks' },
  { id: 'goals', icon: Target, label: 'Goals', href: '/goals' },
  { id: 'health', icon: Heart, label: 'Health', href: '/health' },
  { id: 'finance', icon: DollarSign, label: 'Finance', href: '/finance' },
] as const

export type NavItemId = (typeof NAV_ITEMS)[number]['id']

// ============================================================
// Personality Profile (default / placeholder)
// ============================================================

export const PERSONALITY_PROFILE = {
  disc: {
    type: 'Di',
    dominance: 72,
    influence: 65,
    steadiness: 40,
    conscientiousness: 48,
  },
  mbti: {
    type: 'ENTJ',
    extraversion: 68,
    intuition: 74,
    thinking: 80,
    judging: 62,
  },
  bigFive: {
    openness: 78,
    conscientiousness: 55,
    extraversion: 68,
    agreeableness: 45,
    neuroticism: 42,
  },
} as const

// ============================================================
// Status → Color mapping
// ============================================================

export const COLOR_MAP: Record<string, string> = {
  active: '#00d4ff',
  completed: '#10b981',
  paused: '#f59e0b',
  blocked: '#ef4444',
  archived: '#64748b',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
}

// ============================================================
// Check-in form options
// ============================================================

export const ENERGY_OPTIONS = [
  { value: 1, label: 'Depleted', color: '#ef4444' },
  { value: 2, label: 'Low', color: '#f59e0b' },
  { value: 3, label: 'Moderate', color: '#eab308' },
  { value: 4, label: 'Good', color: '#10b981' },
  { value: 5, label: 'Peak', color: '#00d4ff' },
] as const

export const STRESS_OPTIONS = [
  { value: 1, label: 'Calm', color: '#10b981' },
  { value: 2, label: 'Mild', color: '#eab308' },
  { value: 3, label: 'Moderate', color: '#f59e0b' },
  { value: 4, label: 'High', color: '#ef4444' },
  { value: 5, label: 'Overwhelmed', color: '#dc2626' },
] as const
