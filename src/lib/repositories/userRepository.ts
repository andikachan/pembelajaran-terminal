import { redis } from '@/lib/redis';
import { PlayerProfile } from '@/lib/types';
import { getTodayDateString, updateStreak, calculateLevel } from '@/lib/utils';

const USER_PREFIX = 'user:';

export async function getUserProfile(userId: string): Promise<PlayerProfile | null> {
  try {
    const raw = await redis.get<PlayerProfile | string>(`${USER_PREFIX}${userId}`);
    if (!raw) return null;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function saveUserProfile(profile: PlayerProfile): Promise<boolean> {
  try {
    await redis.set(`${USER_PREFIX}${profile.id}`, profile);
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
}

export async function createGuestProfile(customCallsign?: string): Promise<PlayerProfile> {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const callsign = customCallsign?.trim() || `OPERATOR_${randNum}`;
  const id = `usr_${Date.now()}_${randNum}`;
  const today = getTodayDateString();

  const profile: PlayerProfile = {
    id,
    username: callsign.toLowerCase().replace(/\s+/g, '_'),
    callsign,
    level: 1,
    xp: 0,
    streak: 1,
    lastActiveDate: today,
    completedMissions: [],
    unlockedAchievements: [],
    commandCount: 0,
    accuracyRate: 100,
    createdAt: new Date().toISOString(),
  };

  await saveUserProfile(profile);
  return profile;
}

export async function recordUserActivity(userId: string, isCommandSuccess: boolean): Promise<PlayerProfile | null> {
  const profile = await getUserProfile(userId);
  if (!profile) return null;

  profile.commandCount = (profile.commandCount || 0) + 1;
  const streakInfo = updateStreak(profile.lastActiveDate, profile.streak);
  profile.streak = streakInfo.newStreak;
  profile.lastActiveDate = streakInfo.updatedDate;

  await saveUserProfile(profile);
  return profile;
}
