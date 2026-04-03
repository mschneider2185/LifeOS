import { NextResponse } from 'next/server';
import { getHealthEntries } from '@/lib/notion';
import type { HealthEntry, NotionListResponse } from '@/types/notion';

export async function GET(): Promise<NextResponse<NotionListResponse<HealthEntry>>> {
  try {
    const data = await getHealthEntries(10);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch health entries';
    return NextResponse.json({ data: [], error: message }, { status: 500 });
  }
}
