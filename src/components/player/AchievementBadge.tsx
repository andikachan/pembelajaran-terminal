'use client';

import React from 'react';
import { Achievement } from '@/lib/types';
import { Terminal, Compass, FolderPlus, Search, Sparkles, Moon, Flame, Eraser, Cpu, Trophy, Zap, Award, Lock } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Terminal,
  Compass,
  FolderPlus,
  Search,
  Sparkles,
  Moon,
  Flame,
  Eraser,
  Cpu,
  Trophy,
  Zap,
  Award,
};

export function AchievementBadge({
  achievement,
  unlocked = false,
}: {
  achievement: Achievement;
  unlocked?: boolean;
}) {
  const IconComponent = ICON_MAP[achievement.icon] || Award;

  return (
    <div
      className={`p-3.5 border transition-all duration-200 relative group flex items-start gap-3 ${
        unlocked
          ? 'bg-[#101512] border-[#2C4F30] text-[#E6E6E6]'
          : 'bg-[#0B0D0F] border-[#1C2025] text-[#555B63] opacity-60'
      }`}
    >
      <div
        className={`w-9 h-9 flex items-center justify-center border shrink-0 ${
          unlocked
            ? 'bg-[#16291A] border-[#7CFF6B]/50 text-[#7CFF6B] shadow-[0_0_10px_rgba(124,255,107,0.2)]'
            : 'bg-[#0E1012] border-[#20252C] text-[#484E57]'
        }`}
      >
        {unlocked ? <IconComponent className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4
            className={`font-mono text-xs font-bold uppercase tracking-wider truncate ${
              unlocked ? 'text-[#7CFF6B]' : 'text-[#73777D]'
            }`}
          >
            {achievement.name}
          </h4>
          <span className="font-mono text-[10px] text-[#FFC857] shrink-0 font-semibold">
            +{achievement.xpReward} XP
          </span>
        </div>
        <p className="font-mono text-[11px] text-[#868C96] mt-0.5 leading-snug">
          {achievement.description}
        </p>
      </div>
    </div>
  );
}
