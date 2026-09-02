import { redis } from '@/lib/redis';
import { PlayerProfile, Achievement } from '@/lib/types';
import { getUserProfile, saveUserProfile } from './userRepository';
import { updateLeaderboardScore } from './leaderboardRepository';
import { calculateLevel } from '@/lib/utils';
import { ACHIEVEMENTS } from '@/data/achievements';
import { MISSIONS } from '@/data/missions';

export interface ProgressUpdateResult {
  profile: PlayerProfile;
  newAchievements: Achievement[];
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
}

export async function completeMissionForUser(
  userId: string,
  missionId: string,
  earnedXp: number,
  noHintsUsed: boolean = true
): Promise<ProgressUpdateResult | null> {
  const profile = await getUserProfile(userId);
  if (!profile) return null;

  const isFirstCompletion = !profile.completedMissions.includes(missionId);
  const previousLevel = profile.level;

  if (isFirstCompletion) {
    profile.completedMissions.push(missionId);
    profile.xp += earnedXp;
  } else {
    // Diminished replay XP
    profile.xp += Math.round(earnedXp * 0.25);
  }

  // Recalculate level
  const { level: newLevel } = calculateLevel(profile.xp);
  profile.level = newLevel;

  // Check achievements
  const newAchievements: Achievement[] = [];
  const currentHour = new Date().getHours();

  // 1. FIRST_COMMAND
  if (!profile.unlockedAchievements.includes('FIRST_COMMAND')) {
    profile.unlockedAchievements.push('FIRST_COMMAND');
    const ach = ACHIEVEMENTS.find((a) => a.id === 'FIRST_COMMAND')!;
    profile.xp += ach.xpReward;
    newAchievements.push(ach);
  }

  // 2. FS_NAVIGATOR
  if (
    !profile.unlockedAchievements.includes('FS_NAVIGATOR') &&
    profile.completedMissions.includes('mission-04')
  ) {
    profile.unlockedAchievements.push('FS_NAVIGATOR');
    const ach = ACHIEVEMENTS.find((a) => a.id === 'FS_NAVIGATOR')!;
    profile.xp += ach.xpReward;
    newAchievements.push(ach);
  }

  // 3. FILE_ARCHITECT
  if (
    !profile.unlockedAchievements.includes('FILE_ARCHITECT') &&
    profile.completedMissions.includes('mission-06') &&
    profile.completedMissions.includes('mission-07')
  ) {
    profile.unlockedAchievements.push('FILE_ARCHITECT');
    const ach = ACHIEVEMENTS.find((a) => a.id === 'FILE_ARCHITECT')!;
    profile.xp += ach.xpReward;
    newAchievements.push(ach);
  }

  // 4. GREP_HUNTER
  if (
    !profile.unlockedAchievements.includes('GREP_HUNTER') &&
    profile.completedMissions.includes('mission-13')
  ) {
    profile.unlockedAchievements.push('GREP_HUNTER');
    const ach = ACHIEVEMENTS.find((a) => a.id === 'GREP_HUNTER')!;
    profile.xp += ach.xpReward;
    newAchievements.push(ach);
  }

  // 5. BOSS_SLAYER
  if (
    !profile.unlockedAchievements.includes('BOSS_SLAYER') &&
    profile.completedMissions.includes('mission-20')
  ) {
    profile.unlockedAchievements.push('BOSS_SLAYER');
    const ach = ACHIEVEMENTS.find((a) => a.id === 'BOSS_SLAYER')!;
    profile.xp += ach.xpReward;
    newAchievements.push(ach);
  }

  // 6. NIGHT_OPERATOR
  if (
    !profile.unlockedAchievements.includes('NIGHT_OPERATOR') &&
    (currentHour >= 20 || currentHour < 6)
  ) {
    profile.unlockedAchievements.push('NIGHT_OPERATOR');
    const ach = ACHIEVEMENTS.find((a) => a.id === 'NIGHT_OPERATOR')!;
    profile.xp += ach.xpReward;
    newAchievements.push(ach);
  }

  // 7. ACADEMY_GRADUATE
  if (
    !profile.unlockedAchievements.includes('ACADEMY_GRADUATE') &&
    profile.completedMissions.length >= MISSIONS.length
  ) {
    profile.unlockedAchievements.push('ACADEMY_GRADUATE');
    const ach = ACHIEVEMENTS.find((a) => a.id === 'ACADEMY_GRADUATE')!;
    profile.xp += ach.xpReward;
    newAchievements.push(ach);
  }

  // Save profile and update global leaderboard
  await saveUserProfile(profile);
  await updateLeaderboardScore(profile);

  return {
    profile,
    newAchievements,
    leveledUp: newLevel > previousLevel,
    previousLevel,
    newLevel,
  };
}
