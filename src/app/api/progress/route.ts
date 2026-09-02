import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { completeMissionForUser } from '@/lib/repositories/progressRepository';
import { MISSIONS } from '@/data/missions';

const ProgressSubmitSchema = z.object({
  userId: z.string().min(1),
  missionId: z.string().min(1),
  earnedXp: z.number().int().min(0).max(1000),
  noHintsUsed: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ProgressSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid progress submission payload', details: parsed.error.format() }, { status: 400 });
    }

    const { userId, missionId, earnedXp, noHintsUsed } = parsed.data;

    const mission = MISSIONS.find((m) => m.id === missionId);
    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // Server-side bounds check on XP earned
    const maxAllowedXp = mission.xp;
    const validatedXp = Math.min(earnedXp, maxAllowedXp);

    const result = await completeMissionForUser(userId, missionId, validatedXp, noHintsUsed);

    if (!result) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API /api/progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
