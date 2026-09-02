'use client';

import React from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { LEVELS } from '@/data/levels';
import { MISSIONS } from '@/data/missions';
import { Check, Lock, Play, ShieldAlert, ChevronRight } from 'lucide-react';

export function WorldMap() {
  const { profile, isMissionUnlocked, isLevelUnlocked } = useGame();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 font-mono pb-12">
      {/* Campaign Header */}
      <div className="border border-[#1E242C] bg-[#0A0D10] p-4 sm:p-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] text-[#7CFF6B] uppercase tracking-widest mb-1">
              <span className="w-2 h-2 bg-[#7CFF6B] inline-block animate-pulse" />
              <span>TERMINAL ACADEMY CAMPAIGN MAP</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              OPERATIONAL SECTORS
            </h1>
            <p className="text-xs text-[#8A909A] mt-1 max-w-xl">
              Traverse through the tactical sectors. Clear baseline missions to unlock advanced file system and process operations.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#0F1317] border border-[#212832] px-4 py-2.5 shrink-0">
            <div className="text-center">
              <div className="text-[10px] text-[#73777D]">MISSIONS</div>
              <div className="text-sm font-bold text-white">
                {profile?.completedMissions.length || 0} / {MISSIONS.length}
              </div>
            </div>
            <div className="w-px h-7 bg-[#232932]" />
            <div className="text-center">
              <div className="text-[10px] text-[#73777D]">CLEARED</div>
              <div className="text-sm font-bold text-[#7CFF6B]">
                {Math.round(((profile?.completedMissions.length || 0) / MISSIONS.length) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Levels / Sectors Stack */}
      <div className="space-y-10">
        {LEVELS.map((level, levelIndex) => {
          const levelMissions = MISSIONS.filter((m) => m.levelId === level.id);
          const levelUnlocked = isLevelUnlocked(level.id);
          const completedInLevel = levelMissions.filter(
            (m) => profile?.completedMissions.includes(m.id)
          ).length;
          const levelProgress = Math.round((completedInLevel / levelMissions.length) * 100);

          return (
            <div
              key={level.id}
              className={`border transition-all ${
                levelUnlocked
                  ? 'border-[#222830] bg-[#0A0C0E]'
                  : 'border-[#171A1E] bg-[#070809] opacity-75'
              }`}
            >
              {/* Level Sector Header Bar */}
              <div className="px-4 py-3 bg-[#0E1114] border-b border-[#1C2229] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 flex items-center justify-center font-bold text-xs border"
                    style={{
                      borderColor: levelUnlocked ? level.color : '#2E353F',
                      color: levelUnlocked ? level.color : '#555C66',
                    }}
                  >
                    0{level.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white tracking-wider">
                        {level.name}
                      </h2>
                      {!levelUnlocked && (
                        <span className="flex items-center gap-1 text-[10px] text-[#FF5C5C] border border-[#521C1C] px-1.5 py-0.2">
                          <Lock className="w-2.5 h-2.5" /> LOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#73777D]">{level.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#89909B] text-[11px]">
                    Progress: {completedInLevel}/{levelMissions.length}
                  </span>
                  <div className="w-24 h-1.5 bg-[#14181D] border border-[#242C36] overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${levelProgress}%`,
                        backgroundColor: level.color,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Mission Nodes Grid / Circuit Map */}
              <div className="p-4 sm:p-6 relative">
                {/* SVG Connecting Circuit Trace Background */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10">
                  {levelMissions.map((mission) => {
                    const unlocked = isMissionUnlocked(mission.id);
                    const completed = profile?.completedMissions.includes(mission.id);
                    const isBoss = mission.isBoss;

                    return (
                      <MissionNodeCard
                        key={mission.id}
                        mission={mission}
                        unlocked={unlocked}
                        completed={completed}
                        isBoss={isBoss}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MissionNodeCard({
  mission,
  unlocked,
  completed,
  isBoss,
}: {
  mission: any;
  unlocked: boolean;
  completed?: boolean;
  isBoss?: boolean;
}) {
  const content = (
    <div
      className={`p-3.5 border font-mono transition-all duration-200 relative group flex flex-col justify-between min-h-[115px] ${
        completed
          ? 'bg-[#0E1510] border-[#224426] hover:border-[#7CFF6B]'
          : unlocked
          ? isBoss
            ? 'bg-[#180D0D] border-[#5E1E1E] hover:border-[#FF5C5C] shadow-[0_0_15px_rgba(255,92,92,0.15)]'
            : 'bg-[#101418] border-[#2B3542] hover:border-[#FFC857] shadow-sm'
          : 'bg-[#080A0C] border-[#181D22] opacity-50 cursor-not-allowed'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] text-[#73777D] tracking-widest">
            M-{String(mission.order).padStart(2, '0')}
          </span>

          <div className="flex items-center gap-1.5">
            {completed ? (
              <span className="flex items-center gap-1 text-[10px] text-[#7CFF6B] font-bold">
                <Check className="w-3 h-3" /> DONE
              </span>
            ) : unlocked ? (
              <span className="flex items-center gap-1 text-[10px] text-[#FFC857] font-bold">
                <span className="w-1.5 h-1.5 bg-[#FFC857] rounded-full animate-pulse" /> READY
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-[#555B64]">
                <Lock className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>

        <h3
          className={`text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1.5 ${
            isBoss
              ? 'text-[#FF5C5C]'
              : completed
              ? 'text-[#E6E6E6]'
              : unlocked
              ? 'text-white'
              : 'text-[#636870]'
          }`}
        >
          {isBoss && <ShieldAlert className="w-3.5 h-3.5 text-[#FF5C5C] shrink-0" />}
          <span className="truncate">{mission.title}</span>
        </h3>

        <p className="text-[11px] text-[#7D848F] line-clamp-2 mt-1 leading-snug">
          {mission.objective}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-[#1C2229]/60 flex items-center justify-between text-[10px]">
        <span className="text-[#FFC857] font-semibold">+{mission.xp} XP</span>

        {unlocked && (
          <span className="flex items-center gap-1 text-[#7CFF6B] group-hover:translate-x-0.5 transition-transform font-bold">
            <span>ENTER</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );

  if (!unlocked) {
    return <div>{content}</div>;
  }

  return <Link href={`/missions/${mission.id}`}>{content}</Link>;
}
