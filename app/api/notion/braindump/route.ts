import { NextResponse } from 'next/server';
import { appendBrainDump, NotionConfigError } from '@/lib/notion';
import type { BrainDumpBody, NotionCreateResponse } from '@/types/notion';

export async function POST(
  request: Request,
): Promise<NextResponse<NotionCreateResponse<{ appended: boolean }>>> {
  try {
    const body = (await request.json()) as Partial<BrainDumpBody>;

    if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'text is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    await appendBrainDump(body.text.trim());
    return NextResponse.json({ success: true, data: { appended: true } });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to append brain dump';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
