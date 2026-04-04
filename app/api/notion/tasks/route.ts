import { NextResponse } from 'next/server';
import { getTasks, NotionConfigError } from '@/lib/notion';
import type { Task, NotionListResponse } from '@/types/notion';

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
