import { NextResponse } from 'next/server';
import { getTasks, createTask, NotionConfigError } from '@/lib/notion';
import type { Task, TaskStatus, NotionListResponse, NotionCreateResponse } from '@/types/notion';

export async function GET(
  request: Request,
): Promise<NextResponse<NotionListResponse<Task>>> {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') ?? undefined;
    const data = await getTasks(statusFilter);
    return NextResponse.json({ data });
  } catch (err) {
    const httpStatus = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
    return NextResponse.json({ data: [], error: message }, { status: httpStatus });
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<NotionCreateResponse<Task>>> {
  try {
    const body = await request.json();

    if (!body.task || typeof body.task !== 'string' || body.task.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'task is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    const data = await createTask({
      task: body.task.trim(),
      status: body.status as TaskStatus | undefined,
      effort: body.effort,
      timeBlock: body.timeBlock,
      type: body.type,
      projectId: body.projectId,
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const httpStatus = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to create task';
    return NextResponse.json({ success: false, error: message }, { status: httpStatus });
  }
}
