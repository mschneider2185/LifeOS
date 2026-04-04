import { NextResponse } from 'next/server';
import { getProjects, createProject, NotionConfigError } from '@/lib/notion';
import type { Project, NotionListResponse, NotionCreateResponse } from '@/types/notion';

const WIP_LIMIT = 4;
const VALID_STATUSES = ['Active', 'Maintenance', 'Parked'];
const VALID_ENERGY = ['Low', 'Medium', 'Deep'];

export async function GET(): Promise<NextResponse<NotionListResponse<Project>>> {
  try {
    const data = await getProjects();
    return NextResponse.json({ data });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to fetch projects';
    return NextResponse.json({ data: [], error: message }, { status });
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<NotionCreateResponse<Project>>> {
  try {
    const body = await request.json();

    if (!body.projectName || typeof body.projectName !== 'string' || body.projectName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'projectName is required' },
        { status: 400 },
      );
    }

    const requestedStatus = body.status || 'Active';
    if (!VALID_STATUSES.includes(requestedStatus)) {
      return NextResponse.json(
        { success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    // WIP limit enforcement
    if (requestedStatus === 'Active') {
      const existing = await getProjects();
      const activeCount = existing.filter((p) => p.status === 'Active').length;
      if (activeCount >= WIP_LIMIT) {
        return NextResponse.json(
          {
            success: false,
            error: `WIP limit reached (${activeCount}/${WIP_LIMIT} active). Park or complete a project first.`,
          },
          { status: 409 },
        );
      }
    }

    if (body.energyLevel && !VALID_ENERGY.includes(body.energyLevel)) {
      return NextResponse.json(
        { success: false, error: `energyLevel must be one of: ${VALID_ENERGY.join(', ')}` },
        { status: 400 },
      );
    }

    if (body.tier !== undefined && ![1, 2, 3].includes(body.tier)) {
      return NextResponse.json(
        { success: false, error: 'tier must be 1, 2, or 3' },
        { status: 400 },
      );
    }

    const data = await createProject({
      projectName: body.projectName.trim(),
      status: requestedStatus,
      tier: body.tier,
      weeklyTimeCap: body.weeklyTimeCap,
      energyLevel: body.energyLevel,
      nextAction: body.nextAction,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to create project';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
