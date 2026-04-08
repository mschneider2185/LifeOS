import { NextResponse } from 'next/server';
import { updateActivityLog, NotionConfigError } from '@/lib/notion';
import type { ActivityLog, UpdateActivityLogBody, NotionCreateResponse } from '@/types/notion';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<NotionCreateResponse<ActivityLog>>> {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<UpdateActivityLogBody>;

    const data = await updateActivityLog(id, {
      whatGotDone: body.whatGotDone,
      keyDecisions: body.keyDecisions,
      openItems: body.openItems,
      spend: body.spend,
      tomorrowPriorities: body.tomorrowPriorities,
      projectsTouched: body.projectsTouched,
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to update activity log';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
