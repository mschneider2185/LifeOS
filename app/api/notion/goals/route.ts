import { NextResponse } from 'next/server';
import { getGoals, NotionConfigError } from '@/lib/notion';
import type { Goal, NotionListResponse } from '@/types/notion';

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
