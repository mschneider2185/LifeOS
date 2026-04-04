/**
 * LifeOS — Notion Database Setup Script
 *
 * Creates all required databases and the Brain Dump page via
 * the Notion REST API, then prints the IDs for .env.local.
 *
 * Usage:
 *   npx tsx scripts/setup-notion-databases.ts <PARENT_PAGE_ID>
 *
 * The parent page is any Notion page shared with your LifeOS integration
 * where the databases will be created as child blocks.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const API_KEY = process.env.NOTION_API_KEY;
if (!API_KEY) {
  console.error('ERROR: NOTION_API_KEY is not set in .env.local');
  process.exit(1);
}

const parentPageId = (process.argv[2] || process.env.NOTION_PARENT_PAGE || '')
  .replace(/-/g, '');

if (!parentPageId) {
  console.error(
    'ERROR: No parent page ID provided.\n\n' +
    'Usage:\n' +
    '  npx tsx scripts/setup-notion-databases.ts <PARENT_PAGE_ID>\n\n' +
    'To find a page ID: open any page in Notion → copy the URL →\n' +
    'grab the 32-char hex string at the end.\n\n' +
    'Make sure you\'ve shared that page with the "LifeOS" integration first.'
  );
  process.exit(1);
}

const NOTION_API = 'https://api.notion.com/v1';
const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

async function notionPost(endpoint: string, body: object): Promise<any> {
  const res = await fetch(`${NOTION_API}${endpoint}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(
      `Notion API ${endpoint} failed (${res.status}): ${err.message || JSON.stringify(err)}`
    );
  }
  return res.json();
}

// ============================================================
// Database schemas — matching types/notion.ts exactly
// ============================================================

async function createCheckInsDB(): Promise<string> {
  const res = await notionPost('/databases', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Check-ins' } }],
    properties: {
      'Date': { title: {} },
      'Energy Level': {
        select: {
          options: [
            { name: '🔴 Crashed', color: 'red' },
            { name: '🟠 Low', color: 'orange' },
            { name: '🟡 Okay', color: 'yellow' },
            { name: '🟢 Good', color: 'green' },
            { name: '🔵 Peak', color: 'blue' },
          ],
        },
      },
      'Stress Level': {
        select: {
          options: [
            { name: '1 - Calm', color: 'green' },
            { name: '2 - Manageable', color: 'blue' },
            { name: '3 - Elevated', color: 'yellow' },
            { name: '4 - High', color: 'orange' },
            { name: '5 - Overwhelmed', color: 'red' },
          ],
        },
      },
      'Sleep (hrs)': { number: { format: 'number' } },
      'Exercise': { checkbox: {} },
      'Top Win': { rich_text: {} },
      'Biggest Blocker': { rich_text: {} },
      'Mood Note': { rich_text: {} },
      'Projects Touched': { number: { format: 'number' } },
      'Brain Dump Used': { checkbox: {} },
    },
  });
  return res.id;
}

async function createGoalsDB(): Promise<string> {
  const res = await notionPost('/databases', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Goals' } }],
    properties: {
      'Goal': { title: {} },
      'Status': {
        status: {
          options: [
            { name: 'Not started', color: 'default' },
            { name: 'In progress', color: 'blue' },
            { name: 'Done', color: 'green' },
          ],
          groups: [
            { name: 'To-do', option_ids: [], color: 'gray' },
            { name: 'In progress', option_ids: [], color: 'blue' },
            { name: 'Complete', option_ids: [], color: 'green' },
          ],
        },
      },
      'Quarter': {
        select: {
          options: [
            { name: 'Q1 2026', color: 'blue' },
            { name: 'Q2 2026', color: 'green' },
            { name: 'Q3 2026', color: 'orange' },
            { name: 'Q4 2026', color: 'red' },
          ],
        },
      },
      'Life Area': {
        select: {
          options: [
            { name: 'Career/Projects', color: 'blue' },
            { name: 'Health', color: 'green' },
            { name: 'Finance', color: 'yellow' },
            { name: 'Family', color: 'pink' },
            { name: 'Personal Growth', color: 'purple' },
          ],
        },
      },
      'Progress %': { number: { format: 'percent' } },
      "If I DON'T Do This...": { rich_text: {} },
      'Key Result 1': { rich_text: {} },
      'Key Result 2': { rich_text: {} },
      'Key Result 3': { rich_text: {} },
      'Target Date': { date: {} },
      'Review Notes': { rich_text: {} },
    },
  });
  return res.id;
}

async function createProjectsDB(): Promise<string> {
  const res = await notionPost('/databases', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Projects' } }],
    properties: {
      'Project Name': { title: {} },
      'Status (Active/Maintenance/Parked)': { rich_text: {} },
      'Tier (1/2/3)': { number: { format: 'number' } },
      'Weekly Time Cap (hrs)': { number: { format: 'number' } },
      'Energy Level (Low/Medium/Deep)': { rich_text: {} },
      'Next Action': { rich_text: {} },
      'Notes': { rich_text: {} },
    },
  });
  return res.id;
}

async function createTasksDB(projectsDbId: string): Promise<string> {
  const res = await notionPost('/databases', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Tasks' } }],
    properties: {
      'Task': { title: {} },
      'Status': {
        status: {
          options: [
            { name: 'Not started', color: 'default' },
            { name: 'Doing', color: 'blue' },
            { name: 'Paused', color: 'yellow' },
            { name: 'Done', color: 'green' },
          ],
          groups: [
            { name: 'To-do', option_ids: [], color: 'gray' },
            { name: 'In progress', option_ids: [], color: 'blue' },
            { name: 'Complete', option_ids: [], color: 'green' },
          ],
        },
      },
      'Due Date': { date: {} },
      'Effort': {
        multi_select: {
          options: [
            { name: '15 min', color: 'green' },
            { name: '30 min', color: 'blue' },
            { name: '60 min', color: 'orange' },
            { name: 'Deep', color: 'red' },
          ],
        },
      },
      'Time Block': {
        multi_select: {
          options: [
            { name: 'Evening', color: 'purple' },
            { name: 'Friday Power', color: 'blue' },
            { name: 'Weekend', color: 'green' },
          ],
        },
      },
      'Type': {
        multi_select: {
          options: [
            { name: 'Wilder World', color: 'purple' },
            { name: 'Dev', color: 'blue' },
            { name: 'Family', color: 'pink' },
            { name: 'Finance', color: 'yellow' },
          ],
        },
      },
      'Projects (Database)': {
        relation: {
          database_id: projectsDbId,
          single_property: {},
        },
      },
    },
  });
  return res.id;
}

async function createHealthDB(): Promise<string> {
  const res = await notionPost('/databases', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Health' } }],
    properties: {
      'Week Of': { title: {} },
      'Avg Sleep (hrs)': { number: { format: 'number' } },
      'Exercise Days': { number: { format: 'number' } },
      'Stress Trend': {
        select: {
          options: [
            { name: 'Improving', color: 'green' },
            { name: 'Stable', color: 'blue' },
            { name: 'Worsening', color: 'orange' },
            { name: 'Crisis', color: 'red' },
          ],
        },
      },
      'Burnout Warning': {
        select: {
          options: [
            { name: 'Green - All Good', color: 'green' },
            { name: 'Yellow - Watch It', color: 'yellow' },
            { name: 'Orange - Pull Back', color: 'orange' },
            { name: 'Red - Stop & Reset', color: 'red' },
          ],
        },
      },
      'What Helped': { rich_text: {} },
      'What Hurt': { rich_text: {} },
      'Self-Care Actions': {
        multi_select: {
          options: [
            { name: 'Exercise', color: 'green' },
            { name: 'Meditation', color: 'purple' },
            { name: 'Social', color: 'blue' },
            { name: 'Nature', color: 'green' },
            { name: 'Rest', color: 'yellow' },
          ],
        },
      },
      'Notes': { rich_text: {} },
    },
  });
  return res.id;
}

async function createBrainDumpPage(): Promise<string> {
  const res = await notionPost('/pages', {
    parent: { type: 'page_id', page_id: parentPageId },
    properties: {
      title: { title: [{ type: 'text', text: { content: 'Brain Dump' } }] },
    },
    children: [
      {
        object: 'block',
        type: 'callout',
        callout: {
          icon: { type: 'emoji', emoji: '🧠' },
          rich_text: [
            {
              type: 'text',
              text: {
                content:
                  'Zero-friction brain dump zone. New entries are appended at the bottom by LifeOS.',
              },
            },
          ],
        },
      },
      { object: 'block', type: 'divider', divider: {} },
    ],
  });
  return res.id;
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log(`\nCreating LifeOS databases under parent page: ${parentPageId}\n`);

  console.log('1/6  Check-ins...');
  const checkinsId = await createCheckInsDB();
  console.log(`     ${checkinsId}`);

  console.log('2/6  Goals...');
  const goalsId = await createGoalsDB();
  console.log(`     ${goalsId}`);

  console.log('3/6  Projects...');
  const projectsId = await createProjectsDB();
  console.log(`     ${projectsId}`);

  console.log('4/6  Tasks (linked to Projects)...');
  const tasksId = await createTasksDB(projectsId);
  console.log(`     ${tasksId}`);

  console.log('5/6  Health...');
  const healthId = await createHealthDB();
  console.log(`     ${healthId}`);

  console.log('6/6  Brain Dump page...');
  const brainDumpId = await createBrainDumpPage();
  console.log(`     ${brainDumpId}`);

  const strip = (id: string) => id.replace(/-/g, '');

  console.log('\n========================================');
  console.log('  All databases created successfully!');
  console.log('========================================\n');
  console.log('Add these lines to your .env.local:\n');
  console.log(`NOTION_CHECKIN_DB=${strip(checkinsId)}`);
  console.log(`NOTION_GOALS_DB=${strip(goalsId)}`);
  console.log(`NOTION_PROJECTS_DB=${strip(projectsId)}`);
  console.log(`NOTION_TASKS_DB=${strip(tasksId)}`);
  console.log(`NOTION_HEALTH_DB=${strip(healthId)}`);
  console.log(`NOTION_BRAINDUMP_PAGE=${strip(brainDumpId)}`);
  console.log('\nThen restart the dev server: npm run dev\n');
}

main().catch((err) => {
  console.error('\nFailed to create databases:\n');
  console.error(err.message || err);
  if (String(err.message).includes('object_not_found')) {
    console.error(
      '\nThe parent page was not found. Make sure:\n' +
      '  1. The page ID is correct\n' +
      '  2. The page is shared with your "LifeOS" integration\n' +
      '     (open the page → ... menu → Connections → Add "LifeOS")\n'
    );
  }
  process.exit(1);
});
