import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserProfile, saveUserProfile, createGuestProfile } from '@/lib/repositories/userRepository';

const UserProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  callsign: z.string(),
  level: z.number().int().min(1),
  xp: z.number().int().min(0),
  streak: z.number().int().min(0),
  lastActiveDate: z.string(),
  completedMissions: z.array(z.string()),
  unlockedAchievements: z.array(z.string()),
  commandCount: z.number().int().min(0),
  accuracyRate: z.number().min(0).max(100),
  createdAt: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      const guest = await createGuestProfile();
      return NextResponse.json({ profile: guest });
    }

    const profile = await getUserProfile(userId);
    if (!profile) {
      const newGuest = await createGuestProfile();
      return NextResponse.json({ profile: newGuest });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('API /api/user GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UserProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid profile data', details: parsed.error.format() }, { status: 400 });
    }

    const success = await saveUserProfile(parsed.data);
    return NextResponse.json({ success, profile: parsed.data });
  } catch (error) {
    console.error('API /api/user POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
