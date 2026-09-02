'use client';

import React from 'react';
import { Mission, Level } from '@/lib/types';
import { HintDrawer } from './HintDrawer';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, Crosshair, Sparkles, Terminal, RotateCcw } from 'lucide-react';

interface MissionHUDProps {
  mission: Mission;
  level?: Level;
  hintsRevealed: number;
  onRevealHint: (hintIndex: number) => void;
  currentXpReward: number;
  onResetMission: () => void;
  isCompleted: boolean;
}

export function MissionHUD({
  mission,
  level,
  hintsRevealed,
  onRevealHint,
  currentXpReward,
  onResetMission,
  isCompleted,
}: MissionHUDProps) {
  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* Header card with cyber brackets */}
      <div className="bg-[#0B0D0F] border border-[#1F252C] p-3.5 relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[10px] tracking-widest text-[#73777D] font-mono uppercase">
            <span className="text-[#FFC857]">LEVEL {String(mission.levelId).padStart(2, '0')}</span>
            <span>//</span>
            <span>MISSION {String(mission.order).padStart(2, '0')}</span>
          </div>

          <div className="flex items-center gap-2">
            {mission.isBoss ? (
              <span className="px-2 py-0.5 bg-[#2A0E0E] text-[#FF5C5C] border border-[#6B1B1B] text-[10px] font-bold tracking-wider animate-pulse">
                BOSS MISSION
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-[#12161A] text-[#7CFF6B] border border-[#232F24] text-[10px] font-semibold">
                +{currentXpReward} XP
              </span>
            )}
          </div>
        </div>

        <h1 className="font-mono text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
          {mission.isBoss && <ShieldAlert className="w-4 h-4 text-[#FF5C5C] shrink-0" />}
          <span>{mission.title}</span>
          {isCompleted && (
            <span className="ml-auto text-xs text-[#7CFF6B] border border-[#2B542C] px-1.5 py-0.5">
              ✓ COMPLETED
            </span>
          )}
        </h1>
      </div>

      {/* Scenario Briefing */}
      <div className="bg-[#0B0D0F] border border-[#1F252C] p-3.5 space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A9099] uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5 text-[#7CFF6B]" />
          <span>TACTICAL BRIEFING</span>
        </div>
        <p className="text-xs text-[#C8CCD3] leading-relaxed whitespace-pre-line">
          {mission.scenario}
        </p>
      </div>

      {/* Objective Checklist Card */}
      <div className="bg-[#0D1210] border border-[#244228] p-3.5 space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7CFF6B] uppercase tracking-wider">
          <Crosshair className="w-3.5 h-3.5 text-[#7CFF6B]" />
          <span>CURRENT OBJECTIVE</span>
        </div>
        <div className="p-2.5 bg-[#080B09] border border-[#1C3620] text-xs text-white font-mono flex items-start gap-2">
          <span className="text-[#7CFF6B] font-bold mt-0.5">»</span>
          <span className="leading-snug">{mission.objective}</span>
        </div>
      </div>

      {/* Tip if available */}
      {mission.tip && (
        <div className="bg-[#12110D] border border-[#3D331A] p-2.5 text-[11px] text-[#D8C697] leading-relaxed flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FFC857] shrink-0 mt-0.5" />
          <span>{mission.tip}</span>
        </div>
      )}

      {/* Progressive Hints Drawer */}
      <HintDrawer
        hints={mission.hints}
        hintsRevealed={hintsRevealed}
        onRevealHint={onRevealHint}
        currentXpReward={currentXpReward}
      />

      {/* Reset Mission Button */}
      <div className="pt-1 flex items-center justify-between">
        <button
          onClick={onResetMission}
          className="flex items-center gap-1.5 text-[11px] text-[#6E747F] hover:text-[#E6E6E6] transition-colors font-mono"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET ENVIRONMENT</span>
        </button>
      </div>
    </div>
  );
}
