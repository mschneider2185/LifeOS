import { NextResponse } from 'next/server';
import { getTasks } from '@/lib/notion';
import type { Task, NotionListResponse } from '@/types/notion';

export async function GET(
  request: Request,
): Promise<NextResponse<NotionListResponse<Task>>> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const data = await getTasks(status);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
    return NextResponse.json({ data: [], error: message }, { status: 500 });
  }
}
