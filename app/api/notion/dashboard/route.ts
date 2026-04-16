import { NextResponse } from 'next/server';
import {
  getProjects,
  getCheckIns,
  getCheckInByDate,
  getHealthEntries,
  getGoals,
  NotionConfigError,
} from '@/lib/notion';
import type { DashboardData, NotionListResponse } from '@/types/notion';

export async function GET(
  request: Request,
): Promise<NextResponse<NotionListResponse<DashboardData>>> {
  try {
    const { searchParams } = new URL(request.url);
    // Client passes today's LOCAL date (YYYY-MM-DD via toLocaleDateString('en-CA'))
    // so the dashboard always surfaces today's check-in regardless of Notion's
    // created_time ordering. Fall back to "latest by created_time" if the
    // client didn't pass a date (older callers, server-side tests).
    const today = searchParams.get('today');

    const [projects, latestCheckIn, healthEntries, goals] = await Promise.all([
      getProjects(),
      today ? getCheckInByDate(today) : getCheckIns(1).then((c) => c[0] ?? null),
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
      latestCheckIn,
      latestHealth: healthEntries[0] ?? null,
      inProgressGoals,
    };

    return NextResponse.json({ data: [dashboard] });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
    return NextResponse.json({ data: [], error: message }, { status });
  }
}
