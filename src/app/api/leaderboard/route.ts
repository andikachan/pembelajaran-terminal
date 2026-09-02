import { NextRequest, NextResponse } from 'next/server';
import { getGlobalLeaderboard } from '@/lib/repositories/leaderboardRepository';
import { getUserProfile } from '@/lib/repositories/userRepository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let currentPlayer = null;
    if (userId) {
      currentPlayer = await getUserProfile(userId);
    }

    const leaderboard = await getGlobalLeaderboard(20, currentPlayer);
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('API /api/leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
