import { NextResponse } from 'next/server';
import {
  getActivityLog,
  getActivityLogByDate,
  createActivityLog,
  NotionConfigError,
} from '@/lib/notion';
import type {
  ActivityLog,
  CreateActivityLogBody,
  NotionListResponse,
  NotionCreateResponse,
} from '@/types/notion';

export async function GET(
  request: Request,
): Promise<NextResponse<NotionListResponse<ActivityLog>>> {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      const entry = await getActivityLogByDate(date);
      return NextResponse.json({ data: entry ? [entry] : [] });
    }

    const data = await getActivityLog(7);
    return NextResponse.json({ data });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to fetch activity log';
    return NextResponse.json({ data: [], error: message }, { status });
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<NotionCreateResponse<ActivityLog>>> {
  try {
    const body = (await request.json()) as Partial<CreateActivityLogBody>;

    if (!body.date || typeof body.date !== 'string') {
      return NextResponse.json(
        { success: false, error: 'date is required (title string, e.g. "April 7, 2026")' },
        { status: 400 },
      );
    }

    if (!body.logDate || typeof body.logDate !== 'string') {
      return NextResponse.json(
        { success: false, error: 'logDate is required (ISO date, e.g. "2026-04-07")' },
        { status: 400 },
      );
    }

    // One-per-day soft guard: if an entry already exists for this date, return it
    const existing = await getActivityLogByDate(body.logDate);
    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        error: 'Entry already exists for this date. Returning existing entry.',
      });
    }

    const data = await createActivityLog({
      date: body.date,
      logDate: body.logDate,
      projectsTouched: body.projectsTouched,
      whatGotDone: body.whatGotDone,
      keyDecisions: body.keyDecisions,
      openItems: body.openItems,
      spend: body.spend,
      tomorrowPriorities: body.tomorrowPriorities,
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to create activity log';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
