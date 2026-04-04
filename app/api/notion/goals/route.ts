import { NextResponse } from 'next/server';
import { getGoals, createGoal, NotionConfigError } from '@/lib/notion';
import type { Goal, NotionListResponse, NotionCreateResponse } from '@/types/notion';

export async function GET(): Promise<NextResponse<NotionListResponse<Goal>>> {
  try {
    const data = await getGoals();
    return NextResponse.json({ data });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to fetch goals';
    return NextResponse.json({ data: [], error: message }, { status });
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<NotionCreateResponse<Goal>>> {
  try {
    const body = await request.json();

    if (!body.goal || typeof body.goal !== 'string' || body.goal.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'goal is required' },
        { status: 400 },
      );
    }

    if (!body.ifIDontDoThis || typeof body.ifIDontDoThis !== 'string' || body.ifIDontDoThis.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Consequence framing is required: What happens if you DON\'T do this?' },
        { status: 400 },
      );
    }

    const data = await createGoal({
      goal: body.goal.trim(),
      status: body.status,
      quarter: body.quarter,
      lifeArea: body.lifeArea,
      progressPercent: body.progressPercent ?? 0,
      ifIDontDoThis: body.ifIDontDoThis.trim(),
      keyResult1: body.keyResult1?.trim(),
      keyResult2: body.keyResult2?.trim(),
      keyResult3: body.keyResult3?.trim(),
      targetDate: body.targetDate,
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to create goal';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
