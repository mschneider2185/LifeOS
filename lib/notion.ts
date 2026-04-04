import type {
  CheckIn,
  Goal,
  Project,
  Task,
  HealthEntry,
  EnergyLevel,
  StressLevel,
  GoalStatus,
  Quarter,
  LifeArea,
  StressTrend,
  BurnoutWarning,
  TaskStatus,
  TaskEffort,
  TaskTimeBlock,
  TaskType,
  ProjectStatus,
  ProjectEnergyLevel,
} from '@/types/notion';

// ============================================================
// Notion REST API client (direct fetch, no SDK version issues)
// ============================================================

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

export class NotionConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotionConfigError';
  }
}

function getApiKey(): string {
  const key = process.env.NOTION_API_KEY;
  if (!key) {
    throw new NotionConfigError(
      'NOTION_API_KEY is not configured. Add it to .env.local and restart the dev server.'
    );
  }
  return key;
}

function getDbId(envKey: string): string {
  const id = process.env[envKey];
  if (!id) {
    throw new NotionConfigError(
      `${envKey} is not set. Add it to .env.local and restart the dev server.`
    );
  }
  return id;
}

async function notionFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${NOTION_API}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
      ...options.headers,
    },
  });

  const body = await res.json();

  if (!res.ok) {
    const msg = body?.message || `Notion API error ${res.status}`;
    throw new Error(msg);
  }

  return body;
}

async function queryDatabase(
  dbEnvKey: string,
  opts: {
    sorts?: Array<{ property?: string; timestamp?: string; direction: string }>;
    filter?: Record<string, unknown>;
    page_size?: number;
  } = {},
): Promise<any[]> {
  const dbId = getDbId(dbEnvKey);
  const body: Record<string, unknown> = {};
  if (opts.sorts) body.sorts = opts.sorts;
  if (opts.filter) body.filter = opts.filter;
  if (opts.page_size) body.page_size = opts.page_size;

  const result = await notionFetch(`/databases/${dbId}/query`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return result.results || [];
}

async function createPage(
  dbEnvKey: string,
  properties: Record<string, unknown>,
): Promise<any> {
  const dbId = getDbId(dbEnvKey);
  return notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties,
    }),
  });
}

// ============================================================
// Property Extraction Helpers
// ============================================================

function getRichText(prop: any): string {
  if (!prop || prop.type !== 'rich_text') return '';
  return (prop.rich_text || []).map((t: any) => t.plain_text).join('');
}

function getTitle(prop: any): string {
  if (!prop || prop.type !== 'title') return '';
  return (prop.title || []).map((t: any) => t.plain_text).join('');
}

function getNumber(prop: any): number | null {
  if (!prop || prop.type !== 'number') return null;
  return prop.number;
}

function getCheckbox(prop: any): boolean {
  if (!prop || prop.type !== 'checkbox') return false;
  return prop.checkbox;
}

function getSelect(prop: any): string | null {
  if (!prop || prop.type !== 'select' || !prop.select) return null;
  return prop.select.name;
}

function getStatus(prop: any): string | null {
  if (!prop || prop.type !== 'status' || !prop.status) return null;
  return prop.status.name;
}

function getDate(prop: any): string | null {
  if (!prop || prop.type !== 'date' || !prop.date) return null;
  return prop.date.start;
}

function getMultiSelect(prop: any): string[] {
  if (!prop || prop.type !== 'multi_select') return [];
  return (prop.multi_select || []).map((s: any) => s.name);
}

function getRelationIds(prop: any): string[] {
  if (!prop || prop.type !== 'relation') return [];
  return (prop.relation || []).map((r: any) => r.id);
}

// ============================================================
// Page Parsers
// ============================================================

function parseCheckIn(page: any): CheckIn {
  const p = page.properties;
  return {
    id: page.id,
    date: getTitle(p['Date']),
    energyLevel: getSelect(p['Energy Level']) as EnergyLevel | null,
    stressLevel: getSelect(p['Stress Level']) as StressLevel | null,
    sleepHours: getNumber(p['Sleep (hrs)']),
    exercise: getCheckbox(p['Exercise']),
    topWin: getRichText(p['Top Win']),
    biggestBlocker: getRichText(p['Biggest Blocker']),
    moodNote: getRichText(p['Mood Note']),
    projectsTouched: getNumber(p['Projects Touched']),
    brainDumpUsed: getCheckbox(p['Brain Dump Used']),
  };
}

function parseGoal(page: any): Goal {
  const p = page.properties;
  return {
    id: page.id,
    goal: getTitle(p['Goal']),
    status: getStatus(p['Status']) as GoalStatus | null,
    quarter: getSelect(p['Quarter']) as Quarter | null,
    lifeArea: getSelect(p['Life Area']) as LifeArea | null,
    progressPercent: getNumber(p['Progress %']),
    ifIDontDoThis: getRichText(p["If I DON'T Do This..."]),
    keyResult1: getRichText(p['Key Result 1']),
    keyResult2: getRichText(p['Key Result 2']),
    keyResult3: getRichText(p['Key Result 3']),
    targetDate: getDate(p['Target Date']),
    reviewNotes: getRichText(p['Review Notes']),
  };
}

function parseProject(page: any): Project {
  const p = page.properties;
  return {
    id: page.id,
    projectName: getTitle(p['Project Name']),
    status: getRichText(p['Status (Active/Maintenance/Parked)']) as ProjectStatus | string,
    tier: getNumber(p['Tier (1/2/3)']),
    weeklyTimeCapHrs: getNumber(p['Weekly Time Cap (hrs)']),
    energyLevel: getRichText(p['Energy Level (Low/Medium/Deep)']) as ProjectEnergyLevel | string,
    nextAction: getRichText(p['Next Action']),
    notes: getRichText(p['Notes']),
  };
}

function parseTask(page: any): Task {
  const p = page.properties;
  return {
    id: page.id,
    task: getTitle(p['Task']),
    status: getStatus(p['Status']) as TaskStatus | null,
    dueDate: getDate(p['Due Date']),
    effort: getMultiSelect(p['Effort']) as TaskEffort[],
    timeBlock: getMultiSelect(p['Time Block']) as TaskTimeBlock[],
    type: getMultiSelect(p['Type']) as TaskType[],
    projectIds: getRelationIds(p['Projects (Database)']),
  };
}

function parseHealth(page: any): HealthEntry {
  const p = page.properties;
  return {
    id: page.id,
    weekOf: getTitle(p['Week Of']),
    avgSleepHrs: getNumber(p['Avg Sleep (hrs)']),
    exerciseDays: getNumber(p['Exercise Days']),
    stressTrend: getSelect(p['Stress Trend']) as StressTrend | null,
    burnoutWarning: getSelect(p['Burnout Warning']) as BurnoutWarning | null,
    whatHelped: getRichText(p['What Helped']),
    whatHurt: getRichText(p['What Hurt']),
    selfCareActions: getMultiSelect(p['Self-Care Actions']),
    notes: getRichText(p['Notes']),
  };
}

// ============================================================
// Public Query Functions
// ============================================================

export async function getCheckIns(limit = 10): Promise<CheckIn[]> {
  const results = await queryDatabase('NOTION_CHECKIN_DB', {
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    page_size: limit,
  });
  return results.map(parseCheckIn);
}

export async function createCheckIn(data: {
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
}): Promise<CheckIn> {
  const response = await createPage('NOTION_CHECKIN_DB', {
    Date: { title: [{ text: { content: data.date } }] },
    'Energy Level': { select: { name: data.energyLevel } },
    'Stress Level': { select: { name: data.stressLevel } },
    'Sleep (hrs)': { number: data.sleepHours },
    Exercise: { checkbox: data.exercise },
    'Top Win': {
      rich_text: [{ text: { content: data.topWin ?? '' } }],
    },
    'Biggest Blocker': {
      rich_text: [{ text: { content: data.biggestBlocker ?? '' } }],
    },
    'Mood Note': {
      rich_text: [{ text: { content: data.moodNote ?? '' } }],
    },
    'Projects Touched': { number: data.projectsTouched ?? 0 },
    'Brain Dump Used': { checkbox: data.brainDumpUsed ?? false },
  });
  return parseCheckIn(response);
}

export async function getGoals(): Promise<Goal[]> {
  const results = await queryDatabase('NOTION_GOALS_DB', {
    page_size: 100,
  });
  return results.map(parseGoal);
}

export async function updateGoal(
  pageId: string,
  data: {
    status?: GoalStatus;
    progressPercent?: number;
    reviewNotes?: string;
    keyResult1?: string;
    keyResult2?: string;
    keyResult3?: string;
  },
): Promise<Goal> {
  const properties: Record<string, unknown> = {};

  if (data.status !== undefined) {
    properties['Status'] = { status: { name: data.status } };
  }
  if (data.progressPercent !== undefined) {
    properties['Progress %'] = { number: data.progressPercent };
  }
  if (data.reviewNotes !== undefined) {
    properties['Review Notes'] = {
      rich_text: [{ text: { content: data.reviewNotes } }],
    };
  }
  if (data.keyResult1 !== undefined) {
    properties['Key Result 1'] = {
      rich_text: [{ text: { content: data.keyResult1 } }],
    };
  }
  if (data.keyResult2 !== undefined) {
    properties['Key Result 2'] = {
      rich_text: [{ text: { content: data.keyResult2 } }],
    };
  }
  if (data.keyResult3 !== undefined) {
    properties['Key Result 3'] = {
      rich_text: [{ text: { content: data.keyResult3 } }],
    };
  }

  const response = await notionFetch(`/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  });
  return parseGoal(response);
}

export async function getProjects(): Promise<Project[]> {
  const results = await queryDatabase('NOTION_PROJECTS_DB', {
    page_size: 100,
  });
  return results.map(parseProject);
}

export async function createProject(data: {
  projectName: string;
  status?: string;
  tier?: number;
  weeklyTimeCap?: number;
  energyLevel?: string;
  nextAction?: string;
  notes?: string;
}): Promise<Project> {
  const properties: Record<string, unknown> = {
    'Project Name': { title: [{ text: { content: data.projectName } }] },
  };

  if (data.status) {
    properties['Status (Active/Maintenance/Parked)'] = {
      rich_text: [{ text: { content: data.status } }],
    };
  }
  if (data.tier !== undefined) {
    properties['Tier (1/2/3)'] = { number: data.tier };
  }
  if (data.weeklyTimeCap !== undefined) {
    properties['Weekly Time Cap (hrs)'] = { number: data.weeklyTimeCap };
  }
  if (data.energyLevel) {
    properties['Energy Level (Low/Medium/Deep)'] = {
      rich_text: [{ text: { content: data.energyLevel } }],
    };
  }
  if (data.nextAction) {
    properties['Next Action'] = {
      rich_text: [{ text: { content: data.nextAction } }],
    };
  }
  if (data.notes) {
    properties['Notes'] = {
      rich_text: [{ text: { content: data.notes } }],
    };
  }

  const response = await createPage('NOTION_PROJECTS_DB', properties);
  return parseProject(response);
}

export async function updateProject(
  pageId: string,
  data: {
    status?: string;
    nextAction?: string;
    weeklyTimeCap?: number;
    tier?: number;
    energyLevel?: string;
    notes?: string;
  },
): Promise<Project> {
  const properties: Record<string, unknown> = {};

  if (data.status !== undefined) {
    properties['Status (Active/Maintenance/Parked)'] = {
      rich_text: [{ text: { content: data.status } }],
    };
  }
  if (data.nextAction !== undefined) {
    properties['Next Action'] = {
      rich_text: [{ text: { content: data.nextAction } }],
    };
  }
  if (data.weeklyTimeCap !== undefined) {
    properties['Weekly Time Cap (hrs)'] = { number: data.weeklyTimeCap };
  }
  if (data.tier !== undefined) {
    properties['Tier (1/2/3)'] = { number: data.tier };
  }
  if (data.energyLevel !== undefined) {
    properties['Energy Level (Low/Medium/Deep)'] = {
      rich_text: [{ text: { content: data.energyLevel } }],
    };
  }
  if (data.notes !== undefined) {
    properties['Notes'] = {
      rich_text: [{ text: { content: data.notes } }],
    };
  }

  const response = await notionFetch(`/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  });
  return parseProject(response);
}

export async function getTasks(statusFilter?: string): Promise<Task[]> {
  const opts: Parameters<typeof queryDatabase>[1] = {
    page_size: 100,
  };

  if (statusFilter) {
    opts.filter = {
      property: 'Status',
      status: { equals: statusFilter },
    };
  }

  const results = await queryDatabase('NOTION_TASKS_DB', opts);
  return results.map(parseTask);
}

export async function createTask(data: {
  task: string;
  status?: TaskStatus;
  effort?: TaskEffort[];
  timeBlock?: TaskTimeBlock[];
  type?: TaskType[];
  projectId?: string;
}): Promise<Task> {
  const properties: Record<string, unknown> = {
    'Task': { title: [{ text: { content: data.task } }] },
  };

  if (data.status) {
    properties['Status'] = { status: { name: data.status } };
  }
  if (data.effort?.length) {
    properties['Effort'] = { multi_select: data.effort.map((e) => ({ name: e })) };
  }
  if (data.timeBlock?.length) {
    properties['Time Block'] = { multi_select: data.timeBlock.map((t) => ({ name: t })) };
  }
  if (data.type?.length) {
    properties['Type'] = { multi_select: data.type.map((t) => ({ name: t })) };
  }
  if (data.projectId) {
    properties['Projects (Database)'] = { relation: [{ id: data.projectId }] };
  }

  const response = await createPage('NOTION_TASKS_DB', properties);
  return parseTask(response);
}

export async function updateTask(
  pageId: string,
  data: { status?: TaskStatus },
): Promise<Task> {
  const properties: Record<string, unknown> = {};

  if (data.status !== undefined) {
    properties['Status'] = { status: { name: data.status } };
  }

  const response = await notionFetch(`/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  });
  return parseTask(response);
}

export async function getHealthEntries(limit = 10): Promise<HealthEntry[]> {
  const results = await queryDatabase('NOTION_HEALTH_DB', {
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    page_size: limit,
  });
  return results.map(parseHealth);
}

export async function appendBrainDump(text: string): Promise<void> {
  const blockId = getDbId('NOTION_BRAINDUMP_PAGE');
  const now = new Date().toISOString();
  await notionFetch(`/blocks/${blockId}/children`, {
    method: 'PATCH',
    body: JSON.stringify({
      children: [
        {
          object: 'block',
          type: 'divider',
          divider: {},
        },
        {
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: `Brain Dump — ${now}` } }],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: text } }],
          },
        },
      ],
    }),
  });
}
