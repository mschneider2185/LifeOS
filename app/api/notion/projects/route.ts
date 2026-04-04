import { NextResponse } from 'next/server';
import { getProjects, NotionConfigError } from '@/lib/notion';
import type { Project, NotionListResponse } from '@/types/notion';

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
