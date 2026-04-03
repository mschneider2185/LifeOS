import { Client, isFullPage } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints/common';
import type { QueryDataSourceParameters } from '@notionhq/client/build/src/api-endpoints/data-sources';
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

// --- Singleton Client ---

let notionClient: Client | null = null;

function getNotionClient(): Client {
  if (notionClient) return notionClient;
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error('NOTION_API_KEY environment variable is not set');
  }
  notionClient = new Client({ auth: apiKey });
  return notionClient;
}

// --- Database IDs ---

const DB_IDS = {
  checkins: 'be279e07e4494391936c8134f0d053d4',
  goals: '17f3f35170e04ce2911fcb76182ba62f',
  projects: '7254b157403c4640acae675505cc409d',
  tasks: '2d3e7ce2e2a080329387eddaa6263ee3',
  health: '4e8edb28aaaf4486890d5245731f0db2',
  braindumpPage: '331e7ce2e2a0814c94eef2d3a18a8a87',
} as const;

// --- Property Extraction Helpers ---

type Properties = PageObjectResponse['properties'];
type PropertyValue = Properties[string];

function getRichText(prop: PropertyValue | undefined): string {
  if (!prop || prop.type !== 'rich_text') return '';
  return prop.rich_text
    .map((t) => t.plain_text)
    .join('');
}

function getTitle(prop: PropertyValue | undefined): string {
  if (!prop || prop.type !== 'title') return '';
  return prop.title
    .map((t) => t.plain_text)
    .join('');
}

function getNumber(prop: PropertyValue | undefined): number | null {
  if (!prop || prop.type !== 'number') return null;
  return prop.number;
}

function getCheckbox(prop: PropertyValue | undefined): boolean {
  if (!prop || prop.type !== 'checkbox') return false;
  return prop.checkbox;
}

function getSelect(prop: PropertyValue | undefined): string | null {
  if (!prop || prop.type !== 'select' || !prop.select) return null;
  return prop.select.name;
}

function getStatus(prop: PropertyValue | undefined): string | null {
  if (!prop || prop.type !== 'status' || !prop.status) return null;
  return prop.status.name;
}

function getDate(prop: PropertyValue | undefined): string | null {
  if (!prop || prop.type !== 'date' || !prop.date) return null;
  return prop.date.start;
}

function getMultiSelect(prop: PropertyValue | undefined): string[] {
  if (!prop || prop.type !== 'multi_select') return [];
  return prop.multi_select.map((s) => s.name);
}

function getRelationIds(prop: PropertyValue | undefined): string[] {
  if (!prop || prop.type !== 'relation') return [];
  return prop.relation.map((r) => r.id);
}

// --- Page Parsers ---

function parseCheckIn(page: PageObjectResponse): CheckIn {
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

function parseGoal(page: PageObjectResponse): Goal {
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

function parseProject(page: PageObjectResponse): Project {
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

function parseTask(page: PageObjectResponse): Task {
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

function parseHealth(page: PageObjectResponse): HealthEntry {
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

// --- Public Query Functions ---

export async function getCheckIns(limit = 10): Promise<CheckIn[]> {
  const notion = getNotionClient();
  const response = await notion.dataSources.query({
    data_source_id: DB_IDS.checkins,
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    page_size: limit,
  });
  return response.results
    .filter(isFullPage)
    .map(parseCheckIn);
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
  const notion = getNotionClient();
  const response = await notion.pages.create({
    parent: { database_id: DB_IDS.checkins },
    properties: {
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
    },
  });
  return parseCheckIn(response as PageObjectResponse);
}

export async function getGoals(): Promise<Goal[]> {
  const notion = getNotionClient();
  const response = await notion.dataSources.query({
    data_source_id: DB_IDS.goals,
    page_size: 100,
  });
  return response.results
    .filter(isFullPage)
    .map(parseGoal);
}

export async function getProjects(): Promise<Project[]> {
  const notion = getNotionClient();
  const response = await notion.dataSources.query({
    data_source_id: DB_IDS.projects,
    page_size: 100,
  });
  return response.results
    .filter(isFullPage)
    .map(parseProject);
}

export async function getTasks(statusFilter?: string): Promise<Task[]> {
  const notion = getNotionClient();

  const queryOptions: QueryDataSourceParameters = {
    data_source_id: DB_IDS.tasks,
    page_size: 100,
  };

  if (statusFilter) {
    queryOptions.filter = {
      property: 'Status',
      status: { equals: statusFilter },
    };
  }

  const response = await notion.dataSources.query(queryOptions);
  return response.results
    .filter(isFullPage)
    .map(parseTask);
}

export async function getHealthEntries(limit = 10): Promise<HealthEntry[]> {
  const notion = getNotionClient();
  const response = await notion.dataSources.query({
    data_source_id: DB_IDS.health,
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    page_size: limit,
  });
  return response.results
    .filter(isFullPage)
    .map(parseHealth);
}

export async function appendBrainDump(text: string): Promise<void> {
  const notion = getNotionClient();
  const now = new Date().toISOString();
  await notion.blocks.children.append({
    block_id: DB_IDS.braindumpPage,
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
  });
}
