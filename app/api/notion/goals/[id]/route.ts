import { NextResponse } from 'next/server';
import { updateGoal, NotionConfigError } from '@/lib/notion';
import type { Goal, GoalStatus, NotionCreateResponse } from '@/types/notion';

const VALID_STATUSES: GoalStatus[] = ['Not started', 'In progress', 'Done'];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse<NotionCreateResponse<Goal>>> {
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

    if (body.progressPercent !== undefined) {
      if (typeof body.progressPercent !== 'number' || body.progressPercent < 0 || body.progressPercent > 100) {
        return NextResponse.json(
          { success: false, error: 'progressPercent must be a number between 0 and 100' },
          { status: 400 },
        );
      }
      update.progressPercent = body.progressPercent;
    }

    if (body.reviewNotes !== undefined) {
      if (typeof body.reviewNotes !== 'string') {
        return NextResponse.json(
          { success: false, error: 'reviewNotes must be a string' },
          { status: 400 },
        );
      }
      update.reviewNotes = body.reviewNotes;
    }

    for (const field of ['keyResult1', 'keyResult2', 'keyResult3'] as const) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== 'string') {
          return NextResponse.json(
            { success: false, error: `${field} must be a string` },
            { status: 400 },
          );
        }
        update[field] = body[field];
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 },
      );
    }

    const data = await updateGoal(params.id, update as Parameters<typeof updateGoal>[1]);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to update goal';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
