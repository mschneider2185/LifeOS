import { NextResponse } from 'next/server';
import { getCheckIns, createCheckIn, NotionConfigError } from '@/lib/notion';
import type {
  CheckIn,
  CreateCheckInBody,
  EnergyLevel,
  StressLevel,
  NotionListResponse,
  NotionCreateResponse,
} from '@/types/notion';

const VALID_ENERGY_LEVELS: EnergyLevel[] = [
  '🔴 Crashed',
  '🟠 Low',
  '🟡 Okay',
  '🟢 Good',
  '🔵 Peak',
];

const VALID_STRESS_LEVELS: StressLevel[] = [
  '1 - Calm',
  '2 - Manageable',
  '3 - Elevated',
  '4 - High',
  '5 - Overwhelmed',
];

export async function GET(): Promise<NextResponse<NotionListResponse<CheckIn>>> {
  try {
    const data = await getCheckIns(10);
    return NextResponse.json({ data });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to fetch check-ins';
    return NextResponse.json({ data: [], error: message }, { status });
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<NotionCreateResponse<CheckIn>>> {
  try {
    const body = (await request.json()) as Partial<CreateCheckInBody>;

    // Validate required fields
    if (!body.date || typeof body.date !== 'string') {
      return NextResponse.json(
        { success: false, error: 'date is required and must be a string' },
        { status: 400 },
      );
    }

    if (!body.energyLevel || !VALID_ENERGY_LEVELS.includes(body.energyLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: `energyLevel is required and must be one of: ${VALID_ENERGY_LEVELS.join(', ')}`,
        },
        { status: 400 },
      );
    }

    if (!body.stressLevel || !VALID_STRESS_LEVELS.includes(body.stressLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: `stressLevel is required and must be one of: ${VALID_STRESS_LEVELS.join(', ')}`,
        },
        { status: 400 },
      );
    }

    if (body.sleepHours === undefined || typeof body.sleepHours !== 'number' || body.sleepHours < 0) {
      return NextResponse.json(
        { success: false, error: 'sleepHours is required and must be a non-negative number' },
        { status: 400 },
      );
    }

    if (typeof body.exercise !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'exercise is required and must be a boolean' },
        { status: 400 },
      );
    }

    const data = await createCheckIn({
      date: body.date,
      energyLevel: body.energyLevel,
      stressLevel: body.stressLevel,
      sleepHours: body.sleepHours,
      exercise: body.exercise,
      topWin: body.topWin,
      biggestBlocker: body.biggestBlocker,
      moodNote: body.moodNote,
      projectsTouched: body.projectsTouched,
      brainDumpUsed: body.brainDumpUsed,
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const status = err instanceof NotionConfigError ? 503 : 500;
    const message = err instanceof Error ? err.message : 'Failed to create check-in';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
