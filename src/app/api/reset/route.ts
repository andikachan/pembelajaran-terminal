import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserProfile, saveUserProfile } from '@/lib/repositories/userRepository';

const ResetSchema = z.object({
  userId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ResetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const profile = await getUserProfile(parsed.data.userId);
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    profile.level = 1;
    profile.xp = 0;
    profile.completedMissions = [];
    profile.unlockedAchievements = [];
    profile.commandCount = 0;

    await saveUserProfile(profile);
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('API /api/reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
