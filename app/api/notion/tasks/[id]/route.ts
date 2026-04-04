import { NextResponse } from 'next/server';
import { updateTask, NotionConfigError } from '@/lib/notion';
import type { Task, TaskStatus, NotionCreateResponse } from '@/types/notion';

const VALID_STATUSES: TaskStatus[] = ['Not started', 'Doing', 'Paused', 'Done'];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse<NotionCreateResponse<Task>>> {
  try {
    const body = await request.json();

    if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    const data = await updateTask(params.id, { status: body.status });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to update task';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
