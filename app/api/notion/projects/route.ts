import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/notion';
import type { Project, NotionListResponse } from '@/types/notion';

export async function GET(): Promise<NextResponse<NotionListResponse<Project>>> {
  try {
    const data = await getProjects();
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch projects';
    return NextResponse.json({ data: [], error: message }, { status: 500 });
  }
}
