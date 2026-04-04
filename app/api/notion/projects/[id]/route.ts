import { NextResponse } from 'next/server';
import { updateProject, NotionConfigError } from '@/lib/notion';
import type { Project, NotionCreateResponse } from '@/types/notion';

const VALID_STATUSES = ['Active', 'Maintenance', 'Parked'];
const VALID_ENERGY = ['Low', 'Medium', 'Deep'];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse<NotionCreateResponse<Project>>> {
  try {
    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 },
        );
      }
      update.status = body.status;
    }

    if (body.nextAction !== undefined) {
      if (typeof body.nextAction !== 'string') {
        return NextResponse.json(
          { success: false, error: 'nextAction must be a string' },
          { status: 400 },
        );
      }
      update.nextAction = body.nextAction;
    }

    if (body.weeklyTimeCap !== undefined) {
      if (typeof body.weeklyTimeCap !== 'number' || body.weeklyTimeCap < 0) {
        return NextResponse.json(
          { success: false, error: 'weeklyTimeCap must be a non-negative number' },
          { status: 400 },
        );
      }
      update.weeklyTimeCap = body.weeklyTimeCap;
    }

    if (body.tier !== undefined) {
      if (![1, 2, 3].includes(body.tier)) {
        return NextResponse.json(
          { success: false, error: 'tier must be 1, 2, or 3' },
          { status: 400 },
        );
      }
      update.tier = body.tier;
    }

    if (body.energyLevel !== undefined) {
      if (!VALID_ENERGY.includes(body.energyLevel)) {
        return NextResponse.json(
          { success: false, error: `energyLevel must be one of: ${VALID_ENERGY.join(', ')}` },
          { status: 400 },
        );
      }
      update.energyLevel = body.energyLevel;
    }

    if (body.notes !== undefined) {
      if (typeof body.notes !== 'string') {
        return NextResponse.json(
          { success: false, error: 'notes must be a string' },
          { status: 400 },
        );
      }
      update.notes = body.notes;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 },
      );
    }

    const data = await updateProject(params.id, update);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to update project';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
