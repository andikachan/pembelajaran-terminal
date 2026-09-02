import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates user level from total XP.
 * Formula: Level N requires 300 * N * (N - 1) / 2 XP
 * Level 1: 0 XP
 * Level 2: 300 XP
 * Level 3: 900 XP
 * Level 4: 1800 XP
 * Level 5: 3000 XP
 * Level 6: 4500 XP
 * Level 7: 6300 XP
 * Level 8: 8400 XP
 */
export function calculateLevel(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  let level = 1;
  while (true) {
    const nextReq = getXpForLevel(level + 1);
    if (xp < nextReq) {
      const currentBase = getXpForLevel(level);
      const span = nextReq - currentBase;
      const progressInLevel = Math.max(0, xp - currentBase);
      const progressPercent = span > 0 ? Math.min(100, Math.round((progressInLevel / span) * 100)) : 0;
      return {
        level,
        currentLevelXp: progressInLevel,
        nextLevelXp: span,
        progressPercent,
      };
    }
    level++;
    if (level > 50) break; // sanity safeguard
  }

  return {
    level,
    currentLevelXp: 0,
    nextLevelXp: 1000,
    progressPercent: 100,
  };
}

export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(250 * level * (level - 1) * 0.75);
}

export function formatXp(xp: number): string {
  return new Intl.NumberFormat('en-US').format(xp);
}

export function generateId(prefix = 'op'): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${rand}`;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function isStreakActive(lastActiveDate: string): boolean {
  if (!lastActiveDate) return false;
  const today = new Date(getTodayDateString());
  const last = new Date(lastActiveDate);
  const diffTime = Math.abs(today.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 1;
}

export function updateStreak(lastActiveDate: string, currentStreak: number): { newStreak: number; updatedDate: string } {
  const today = getTodayDateString();
  if (!lastActiveDate) {
    return { newStreak: 1, updatedDate: today };
  }
  if (lastActiveDate === today) {
    return { newStreak: currentStreak || 1, updatedDate: today };
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastActiveDate === yesterdayStr) {
    return { newStreak: (currentStreak || 0) + 1, updatedDate: today };
  }

  // Streak reset
  return { newStreak: 1, updatedDate: today };
}
