'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PlayerProfile, Achievement, Mission } from '@/lib/types';
import { MISSIONS } from '@/data/missions';
import { LEVELS } from '@/data/levels';
import { calculateLevel, updateStreak, getTodayDateString } from '@/lib/utils';
import { useSound } from './SoundContext';

interface GameContextType {
  profile: PlayerProfile | null;
  isLoading: boolean;
  activeLevelId: number;
  setActiveLevelId: (lvl: number) => void;
  updateCallsign: (callsign: string) => Promise<void>;
  completeMission: (missionId: string, earnedXp: number, noHintsUsed?: boolean) => Promise<{
    success: boolean;
    newAchievements: Achievement[];
    leveledUp: boolean;
    previousLevel: number;
    newLevel: number;
  }>;
  recordCommandExecution: (isSuccess: boolean) => void;
  isMissionUnlocked: (missionId: string) => boolean;
  isLevelUnlocked: (levelId: number) => boolean;
  getNextMissionId: (currentMissionId?: string) => string | null;
  resetProgress: () => Promise<void>;
}

const LOCAL_STORAGE_KEY = 'tq_player_profile_v2';
const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const { playUnlock } = useSound();

  // Load or create player profile on startup
  useEffect(() => {
    async function initPlayer() {
      try {
        let saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        let parsed: PlayerProfile | null = null;

        if (saved) {
          try {
            parsed = JSON.parse(saved);
          } catch (e) {
            console.warn('Failed parsing local profile', e);
          }
        }

        if (parsed) {
          // Update streak check
          const streakInfo = updateStreak(parsed.lastActiveDate, parsed.streak);
          parsed.streak = streakInfo.newStreak;
          parsed.lastActiveDate = streakInfo.updatedDate;
          setProfile(parsed);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));

          // Try syncing with API in background
          fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed),
          }).catch(() => {});
        } else {
          // Create initial guest profile
          const rand = Math.floor(1000 + Math.random() * 9000);
          const newProf: PlayerProfile = {
            id: `usr_${Date.now()}_${rand}`,
            username: `operator_${rand}`,
            callsign: `OPERATOR_${rand}`,
            level: 1,
            xp: 0,
            streak: 1,
            lastActiveDate: getTodayDateString(),
            completedMissions: [],
            unlockedAchievements: [],
            commandCount: 0,
            accuracyRate: 100,
            createdAt: new Date().toISOString(),
          };
          setProfile(newProf);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProf));

          fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProf),
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Error initializing player profile:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initPlayer();
  }, []);

  const updateCallsign = async (callsign: string) => {
    if (!profile) return;
    const updated: PlayerProfile = {
      ...profile,
      callsign: callsign.trim().toUpperCase(),
      username: callsign.trim().toLowerCase().replace(/\s+/g, '_'),
    };
    setProfile(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Network sync failed', e);
    }
  };

  const recordCommandExecution = useCallback(
    (isSuccess: boolean) => {
      if (!profile) return;
      const totalCmds = (profile.commandCount || 0) + 1;
      const updated: PlayerProfile = {
        ...profile,
        commandCount: totalCmds,
      };
      setProfile(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    },
    [profile]
  );

  const isLevelUnlocked = useCallback(
    (levelId: number): boolean => {
      if (levelId === 1) return true;
      if (!profile) return false;

      const levelDef = LEVELS.find((l) => l.id === levelId);
      if (!levelDef) return false;

      // Unlocked if player XP meets threshold OR completed at least 80% of previous level missions
      const prevLevelMissions = MISSIONS.filter((m) => m.levelId === levelId - 1);
      const completedPrevCount = prevLevelMissions.filter((m) => profile.completedMissions.includes(m.id)).length;
      const ratio = prevLevelMissions.length > 0 ? completedPrevCount / prevLevelMissions.length : 0;

      return profile.xp >= levelDef.minXpRequired || ratio >= 0.8;
    },
    [profile]
  );

  const isMissionUnlocked = useCallback(
    (missionId: string): boolean => {
      const mission = MISSIONS.find((m) => m.id === missionId);
      if (!mission) return false;

      // First mission is always unlocked
      if (mission.id === 'mission-01' || mission.order === 1) return true;

      // Check level access
      if (!isLevelUnlocked(mission.levelId)) return false;

      if (!profile) return false;

      // If already completed, it's unlocked
      if (profile.completedMissions.includes(missionId)) return true;

      // Mission unlocked if the previous mission in sequence is completed
      const prevMission = MISSIONS.find((m) => m.order === mission.order - 1);
      if (prevMission && profile.completedMissions.includes(prevMission.id)) {
        return true;
      }

      return false;
    },
    [profile, isLevelUnlocked]
  );

  const getNextMissionId = useCallback(
    (currentMissionId?: string): string | null => {
      if (!currentMissionId) {
        // Return first uncompleted mission
        const nextUncompleted = MISSIONS.find(
          (m) => !profile?.completedMissions.includes(m.id) && isMissionUnlocked(m.id)
        );
        return nextUncompleted ? nextUncompleted.id : 'mission-01';
      }

      const current = MISSIONS.find((m) => m.id === currentMissionId);
      if (!current) return null;

      const nextInOrder = MISSIONS.find((m) => m.order === current.order + 1);
      if (nextInOrder) {
        return nextInOrder.id;
      }

      return null;
    },
    [profile, isMissionUnlocked]
  );

  const completeMission = async (
    missionId: string,
    earnedXp: number,
    noHintsUsed: boolean = true
  ) => {
    if (!profile) {
      return {
        success: false,
        newAchievements: [],
        leveledUp: false,
        previousLevel: 1,
        newLevel: 1,
      };
    }

    const previousLevel = profile.level;
    const isFirstCompletion = !profile.completedMissions.includes(missionId);

    // Update local state immediately for instant responsive feedback
    const updatedCompleted = isFirstCompletion
      ? [...profile.completedMissions, missionId]
      : profile.completedMissions;

    const addedXp = isFirstCompletion ? earnedXp : Math.round(earnedXp * 0.25);
    const updatedXp = profile.xp + addedXp;
    const { level: updatedLevel } = calculateLevel(updatedXp);

    const updatedProfile: PlayerProfile = {
      ...profile,
      xp: updatedXp,
      level: updatedLevel,
      completedMissions: updatedCompleted,
    };

    setProfile(updatedProfile);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProfile));

    // Try server sync
    let serverRes: any = null;
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          missionId,
          earnedXp,
          noHintsUsed,
        }),
      });
      if (res.ok) {
        serverRes = await res.json();
      }
    } catch (e) {
      console.warn('Failed to sync progress with API server:', e);
    }

    if (serverRes?.profile) {
      setProfile(serverRes.profile);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverRes.profile));
    }

    if (updatedLevel > previousLevel) {
      playUnlock();
    }

    return {
      success: true,
      newAchievements: serverRes?.newAchievements || [],
      leveledUp: updatedLevel > previousLevel,
      previousLevel,
      newLevel: updatedLevel,
    };
  };

  const resetProgress = async () => {
    if (!profile) return;
    const resetProf: PlayerProfile = {
      ...profile,
      level: 1,
      xp: 0,
      completedMissions: [],
      unlockedAchievements: [],
      commandCount: 0,
    };
    setProfile(resetProf);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resetProf));

    try {
      await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      });
    } catch (e) {}
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        isLoading,
        activeLevelId,
        setActiveLevelId,
        updateCallsign,
        completeMission,
        recordCommandExecution,
        isMissionUnlocked,
        isLevelUnlocked,
        getNextMissionId,
        resetProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
}
