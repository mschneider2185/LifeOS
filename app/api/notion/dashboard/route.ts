import { NextResponse } from 'next/server';
import { getProjects, getCheckIns, getHealthEntries, getGoals } from '@/lib/notion';
import type { DashboardData, NotionListResponse } from '@/types/notion';

export async function GET(): Promise<NextResponse<NotionListResponse<DashboardData>>> {
  try {
    const [projects, checkIns, healthEntries, goals] = await Promise.all([
      getProjects(),
      getCheckIns(1),
      getHealthEntries(1),
      getGoals(),
    ]);

    const activeProjectsCount = projects.filter(
      (p) => p.status === 'Active',
    ).length;

    const inProgressGoals = goals.filter(
      (g) => g.status === 'In progress',
    );

    const dashboard: DashboardData = {
      activeProjectsCount,
      latestCheckIn: checkIns[0] ?? null,
      latestHealth: healthEntries[0] ?? null,
      inProgressGoals,
    };

    return NextResponse.json({ data: [dashboard] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
    return NextResponse.json({ data: [], error: message }, { status: 500 });
  }
}
