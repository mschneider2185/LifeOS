// ============================================================
// Notion Database Type Definitions for LifeOS
// ============================================================

// --- Energy & Status Enums ---

export type EnergyLevel = '🔴 Crashed' | '🟠 Low' | '🟡 Okay' | '🟢 Good' | '🔵 Peak';

export type StressLevel =
  | '1 - Calm'
  | '2 - Manageable'
  | '3 - Elevated'
  | '4 - High'
  | '5 - Overwhelmed';

export type GoalStatus = 'Not started' | 'In progress' | 'Done';

export type Quarter =
  | 'Q1 2026'
  | 'Q2 2026'
  | 'Q3 2026'
  | 'Q4 2026';

export type LifeArea =
  | 'Career/Projects'
  | 'Health'
  | 'Finance'
  | 'Family'
  | 'Personal Growth';

export type ProjectStatus = 'Active' | 'Maintenance' | 'Parked';

export type ProjectEnergyLevel = 'Low' | 'Medium' | 'Deep';

export type TaskStatus = 'Not started' | 'Doing' | 'Paused' | 'Done';

export type TaskEffort = '15 min' | '30 min' | '60 min' | 'Deep';

export type TaskTimeBlock = 'Evening' | 'Friday Power' | 'Weekend';

export type TaskType = 'Wilder World' | 'Dev' | 'Family' | 'Finance';

export type StressTrend = 'Improving' | 'Stable' | 'Worsening' | 'Crisis';

export type BurnoutWarning =
  | 'Green - All Good'
  | 'Yellow - Watch It'
  | 'Orange - Pull Back'
  | 'Red - Stop & Reset';

// --- Parsed Domain Objects ---

export interface CheckIn {
  id: string;
  date: string;
  energyLevel: EnergyLevel | null;
  stressLevel: StressLevel | null;
  sleepHours: number | null;
  exercise: boolean;
  topWin: string;
  biggestBlocker: string;
  moodNote: string;
  projectsTouched: number | null;
  brainDumpUsed: boolean;
}

export interface Goal {
  id: string;
  goal: string;
  status: GoalStatus | null;
  quarter: Quarter | null;
  lifeArea: LifeArea | null;
  progressPercent: number | null;
  ifIDontDoThis: string;
  keyResult1: string;
  keyResult2: string;
  keyResult3: string;
  targetDate: string | null;
  reviewNotes: string;
}

export interface Project {
  id: string;
  projectName: string;
  status: ProjectStatus | string;
  tier: number | null;
  weeklyTimeCapHrs: number | null;
  energyLevel: ProjectEnergyLevel | string;
  nextAction: string;
  notes: string;
}

export interface Task {
  id: string;
  task: string;
  status: TaskStatus | null;
  dueDate: string | null;
  effort: TaskEffort[];
  timeBlock: TaskTimeBlock[];
  type: TaskType[];
  projectIds: string[];
}

export interface HealthEntry {
  id: string;
  weekOf: string;
  avgSleepHrs: number | null;
  exerciseDays: number | null;
  stressTrend: StressTrend | null;
  burnoutWarning: BurnoutWarning | null;
  whatHelped: string;
  whatHurt: string;
  selfCareActions: string[];
  notes: string;
}

export interface ActivityLog {
  id: string;
  date: string;
  logDate: string | null;
  projectsTouched: string[];
  whatGotDone: string;
  keyDecisions: string;
  openItems: string;
  spend: number | null;
  tomorrowPriorities: string;
}

export type BrainDumpCategory = 'task' | 'idea' | 'worry' | 'note' | 'project' | 'someday';

export interface BrainDump {
  id: string;
  title: string;
  content: string;
  category: BrainDumpCategory | null;
  triaged: boolean;
  createdAt: string | null;
}

// --- POST Request Bodies ---

export interface CreateCheckInBody {
  date: string;
  energyLevel: EnergyLevel;
  stressLevel: StressLevel;
  sleepHours: number;
  exercise: boolean;
  topWin?: string;
  biggestBlocker?: string;
  moodNote?: string;
  projectsTouched?: number;
  brainDumpUsed?: boolean;
}

export interface BrainDumpBody {
  content: string;
  category?: BrainDumpCategory;
}

export interface CreateActivityLogBody {
  date: string;
  logDate: string;
  projectsTouched?: string[];
  whatGotDone?: string;
  keyDecisions?: string;
  openItems?: string;
  spend?: number;
  tomorrowPriorities?: string;
}

export interface UpdateActivityLogBody {
  whatGotDone?: string;
  keyDecisions?: string;
  openItems?: string;
  spend?: number;
  tomorrowPriorities?: string;
  projectsTouched?: string[];
}

// --- API Response Types ---

export interface NotionListResponse<T> {
  data: T[];
  error?: string;
}

export interface NotionCreateResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- Dashboard Aggregate ---

export interface DashboardData {
  activeProjectsCount: number;
  latestCheckIn: CheckIn | null;
  latestHealth: HealthEntry | null;
  inProgressGoals: Goal[];
}
