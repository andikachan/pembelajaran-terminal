'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MISSIONS } from '@/data/missions';
import { LEVELS } from '@/data/levels';
import { VirtualFileSystem } from '@/lib/vfs/VirtualFileSystem';
import { DEFAULT_VFS_ROOT } from '@/data/defaultFilesystem';
import { validateMissionCommand } from '@/lib/validators/missionValidator';
import { CommandExecutionResult } from '@/lib/vfs/commandInterpreter';
import { useGame } from '@/context/GameContext';
import { useSound } from '@/context/SoundContext';
import { useLanguage } from '@/context/LanguageContext';
import { MissionHUD } from '@/components/mission/MissionHUD';
import { Terminal } from '@/components/terminal/Terminal';
import { VirtualFileSystemTree } from '@/components/terminal/VirtualFileSystemTree';
import { MissionSuccessModal } from '@/components/mission/MissionSuccessModal';
import { BossVictoryBanner } from '@/components/mission/BossVictoryBanner';
import { Achievement, TerminalOutputLine } from '@/lib/types';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function MissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    profile,
    completeMission,
    isMissionUnlocked,
    recordCommandExecution,
    getNextMissionId,
  } = useGame();
  const { playSuccess, playBossVictory } = useSound();
  const { t, getMissionText, getLevelText } = useLanguage();

  const mission = useMemo(() => {
    return MISSIONS.find((m) => m.id === missionId);
  }, [missionId]);

  const level = useMemo(() => {
    if (!mission) return undefined;
    return LEVELS.find((l) => l.id === mission.levelId);
  }, [mission]);

  const locMission = getMissionText(missionId);
  const locLevel = level ? getLevelText(level.id) : undefined;

  // Create isolated Virtual File System for this mission
  const [vfs, setVfs] = useState<VirtualFileSystem>(() => new VirtualFileSystem());
  const [treeVersion, setTreeVersion] = useState(0);
  const [terminalResetKey, setTerminalResetKey] = useState(0);

  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState<boolean>(false);
  const [isBossBannerOpen, setIsBossBannerOpen] = useState<boolean>(false);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [leveledUp, setLeveledUp] = useState<boolean>(false);
  const [newLevel, setNewLevel] = useState<number>(1);

  // Re-initialize VFS whenever mission changes
  useEffect(() => {
    if (!mission) return;

    setHintsRevealed(0);
    setIsCompletedModalOpen(false);
    setIsBossBannerOpen(false);

    const baseFs = JSON.parse(JSON.stringify(DEFAULT_VFS_ROOT));

    if (mission.customInitialFs) {
      for (const [pathKey, fileNode] of Object.entries(mission.customInitialFs)) {
        const parts = pathKey.split('/').filter(Boolean);
        let cur = baseFs;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!cur.children) cur.children = {};
          if (!cur.children[parts[i]]) {
            cur.children[parts[i]] = {
              name: parts[i],
              type: 'directory',
              permissions: 'rwxr-xr-x',
              owner: 'root',
              group: 'root',
              size: 4096,
              updatedAt: new Date().toISOString(),
              children: {},
            };
          }
          cur = cur.children[parts[i]];
        }
        const fileName = parts[parts.length - 1];
        if (!cur.children) cur.children = {};
        cur.children[fileName] = fileNode;
      }
    }

    const newVfs = new VirtualFileSystem(baseFs, mission.initialPath || '/home/player');
    setVfs(newVfs);
    setTreeVersion((v) => v + 1);
  }, [mission]);

  const currentXpReward = useMemo(() => {
    if (!mission) return 0;
    let xp = mission.xp;
    if (hintsRevealed > 0) {
      const penalty = mission.hints
        .slice(0, hintsRevealed)
        .reduce((sum, h) => sum + h.xpPenalty, 0);
      xp = Math.max(25, xp - penalty);
    }
    return xp;
  }, [mission, hintsRevealed]);

  const handleRevealHint = () => {
    setHintsRevealed((prev) => Math.min(mission?.hints.length || 0, prev + 1));
  };

  const handleResetMission = () => {
    if (!mission) return;
    const baseFs = JSON.parse(JSON.stringify(DEFAULT_VFS_ROOT));
    const newVfs = new VirtualFileSystem(baseFs, mission.initialPath || '/home/player');
    setVfs(newVfs);
    setTreeVersion((v) => v + 1);
    setTerminalResetKey((k) => k + 1);
  };

  const handleCommandExecution = useCallback(
    async (result: CommandExecutionResult) => {
      if (!mission) return;

      recordCommandExecution(result.exitCode === 0);

      // Validate command against mission objective
      const valResult = validateMissionCommand(
        mission,
        result,
        vfs,
        hintsRevealed
      );

      if (valResult.success) {
        const netXp = valResult.xpEarned || currentXpReward;
        setEarnedXp(netXp);

        if (mission.isBoss) {
          playBossVictory();
          setIsBossBannerOpen(true);
        } else {
          playSuccess();
          setIsCompletedModalOpen(true);
        }

        const progResult = await completeMission(
          mission.id,
          netXp,
          hintsRevealed === 0
        );

        if (progResult) {
          setNewAchievements(progResult.newAchievements);
          setLeveledUp(progResult.leveledUp);
          setNewLevel(progResult.newLevel);
        }
      }
    },
    [mission, vfs, hintsRevealed, currentXpReward, recordCommandExecution, playBossVictory, playSuccess, completeMission]
  );

  if (!mission) {
    return (
      <div className="text-center py-20 font-mono">
        <div className="text-sm font-bold text-[#FF5C5C] mb-2">
          ERROR 404: SECTOR MISSION NOT FOUND
        </div>
        <p className="text-xs text-[#73777D] mb-4">
          The requested mission coordinate does not exist in registry.
        </p>
        <Link href="/missions" className="text-xs text-[#7CFF6B] underline">
          « {t.common.returnToMap}
        </Link>
      </div>
    );
  }

  const unlocked = isMissionUnlocked(mission.id);
  const isMissionCompleted = profile?.completedMissions.includes(mission.id) || false;
  const nextMissionId = getNextMissionId(mission.id);

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-[#0E1012] border border-[#2B1B1B] text-center font-mono space-y-4">
        <div className="w-12 h-12 mx-auto bg-[#1C0F0F] border border-[#591F1F] text-[#FF5C5C] flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          {t.common.locked}
        </h2>
        <p className="text-xs text-[#8A9099] leading-relaxed">
          Level {mission.levelId}
        </p>
        <Link href="/missions">
          <button className="px-4 py-2 bg-[#12161A] border border-[#2B3542] text-[#7CFF6B] hover:border-[#7CFF6B] text-xs font-mono tracking-wider transition-colors mt-2">
            « {t.common.backToMap}
          </button>
        </Link>
      </div>
    );
  }

  const title = locMission?.title || mission.title;
  const objective = locMission?.objective || mission.objective;

  const initialTerminalLines: TerminalOutputLine[] = [
    {
      id: 'brief-1',
      type: 'system',
      text: `SESSION INITIATED // MISSION ${String(mission.order).padStart(2, '0')}: ${title.toUpperCase()}`,
    },
    {
      id: 'brief-2',
      type: 'system',
      text: `OBJECTIVE: ${objective}`,
    },
  ];

  return (
    <div className="space-y-4 font-mono">
      {/* Breadcrumbs Navigation Bar */}
      <div className="flex items-center justify-between text-xs text-[#73777D] border-b border-[#181D23] pb-2.5">
        <div className="flex items-center gap-2">
          <Link
            href="/missions"
            className="flex items-center gap-1.5 text-[#888E99] hover:text-[#7CFF6B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.common.backToMap}</span>
          </Link>
          <span>/</span>
          <span className="text-[#A5ABB5]">{locLevel?.name || `LEVEL ${mission.levelId}`}</span>
          <span>/</span>
          <span className="text-[#FFC857] font-semibold">{title}</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px]">
          <span className="text-[#555B64]">{t.common.status}:</span>
          {isMissionCompleted ? (
            <span className="text-[#7CFF6B] flex items-center gap-1 font-bold">
              <CheckCircle className="w-3 h-3" /> {t.common.cleared}
            </span>
          ) : (
            <span className="text-[#FFC857] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 bg-[#FFC857] rounded-full animate-pulse" /> {t.common.inProgress}
            </span>
          )}
        </div>
      </div>

      {/* Main Game HUD 3-Column / Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Mission HUD & Objectives (4 cols on lg) */}
        <div className="lg:col-span-4 order-1">
          <MissionHUD
            mission={mission}
            level={level}
            hintsRevealed={hintsRevealed}
            onRevealHint={handleRevealHint}
            currentXpReward={currentXpReward}
            onResetMission={handleResetMission}
            isCompleted={isMissionCompleted}
          />
        </div>

        {/* CENTER COLUMN: Interactive Terminal (5 cols on lg) */}
        <div className="lg:col-span-5 order-2">
          <Terminal
            key={`term-${mission.id}-${terminalResetKey}`}
            vfs={vfs}
            onExecuteCommand={handleCommandExecution}
            initialLines={initialTerminalLines}
            onVfsChange={() => setTreeVersion((v) => v + 1)}
          />
        </div>

        {/* RIGHT COLUMN: Virtual Filesystem Observer & Quick Status (3 cols on lg) */}
        <div className="lg:col-span-3 order-3 space-y-4">
          <VirtualFileSystemTree
            key={`tree-${treeVersion}`}
            root={vfs.getSnapshot().root}
            currentPath={vfs.getCwd()}
          />

          {/* Quick Stats Panel */}
          <div className="bg-[#0B0D0F] border border-[#1F252C] p-3 font-mono text-xs space-y-2.5">
            <div className="text-[10px] text-[#73777D] uppercase tracking-widest font-bold border-b border-[#1A1F26] pb-1">
              OPERATIONAL TELEMETRY
            </div>
            <div className="flex items-center justify-between text-[#8A9099]">
              <span>{t.common.commandsSent}:</span>
              <span className="text-white font-bold">{profile?.commandCount || 0}</span>
            </div>
            <div className="flex items-center justify-between text-[#8A9099]">
              <span>{t.common.missionsDone}:</span>
              <span className="text-[#7CFF6B] font-bold">
                {profile?.completedMissions.length || 0} / {MISSIONS.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#8A9099]">
              <span>{t.common.activeStreak}:</span>
              <span className="text-[#FFC857] font-bold">{profile?.streak || 1} {t.common.days}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Celebration Modal */}
      {isCompletedModalOpen && (
        <MissionSuccessModal
          mission={mission}
          xpEarned={earnedXp}
          newAchievements={newAchievements}
          leveledUp={leveledUp}
          newLevel={newLevel}
          nextMissionId={nextMissionId}
          onContinue={() => setIsCompletedModalOpen(false)}
          onReplay={() => {
            setIsCompletedModalOpen(false);
            handleResetMission();
          }}
        />
      )}

      {/* Boss Victory Banner */}
      {isBossBannerOpen && (
        <BossVictoryBanner
          xpEarned={earnedXp}
          onContinue={() => setIsBossBannerOpen(false)}
        />
      )}
    </div>
  );
}
