import { NextResponse } from 'next/server';
import { getBrainDumps, createBrainDump, NotionConfigError } from '@/lib/notion';
import type { BrainDumpBody, BrainDump, NotionListResponse, NotionCreateResponse } from '@/types/notion';

export async function GET(): Promise<NextResponse<NotionListResponse<BrainDump>>> {
  try {
    const entries = await getBrainDumps(20);
    return NextResponse.json({ data: entries });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to load brain dumps';
    return NextResponse.json({ data: [], error: message }, { status });
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<NotionCreateResponse<BrainDump>>> {
  try {
    const body = (await request.json()) as Partial<BrainDumpBody>;

    if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'content is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    const content = body.content.trim();
    const title = content.length > 60 ? content.slice(0, 57) + '...' : content;

    const entry = await createBrainDump({
      title,
      content,
      category: body.category,
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to create brain dump';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
