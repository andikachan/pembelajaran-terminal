'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Mission, Achievement } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Trophy, ArrowRight, RotateCcw, CheckCircle2, Award, Zap } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface MissionSuccessModalProps {
  mission: Mission;
  xpEarned: number;
  newAchievements: Achievement[];
  leveledUp: boolean;
  newLevel: number;
  nextMissionId: string | null;
  onContinue: () => void;
  onReplay: () => void;
}

export function MissionSuccessModal({
  mission,
  xpEarned,
  newAchievements,
  leveledUp,
  newLevel,
  nextMissionId,
  onContinue,
  onReplay,
}: MissionSuccessModalProps) {
  const { t, getMissionText, getAchievementText } = useLanguage();
  const loc = getMissionText(mission.id);

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#7CFF6B', '#FFC857', '#4EE2EC'],
      });
    } catch (e) {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0C0F12] border-2 border-[#7CFF6B]/70 p-6 shadow-[0_0_40px_rgba(124,255,107,0.2)] font-mono relative">
        {/* Header */}
        <div className="text-center space-y-2 mb-6 border-b border-[#1E252D] pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#152317] border border-[#2D5630] text-[#7CFF6B] text-xs font-bold tracking-widest uppercase">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.missionHUD.commandAccepted}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wider">
            {t.missionHUD.missionComplete}
          </h2>
          <p className="text-xs text-[#8A9099] max-w-sm mx-auto">
            {loc?.completionMessage || mission.completionMessage || 'Sector objectives achieved. System normalized.'}
          </p>
        </div>

        {/* Level Up Banner if applicable */}
        {leveledUp && (
          <div className="mb-5 p-3 bg-[#241A0B] border border-[#FFC857] text-[#FFC857] flex items-center gap-3 animate-bounce">
            <Trophy className="w-6 h-6 text-[#FFC857] shrink-0" />
            <div>
              <div className="text-xs font-bold tracking-widest uppercase">
                {t.missionHUD.rankPromotion}
              </div>
              <div className="text-sm font-extrabold text-white">
                {t.missionHUD.advancedTo} {String(newLevel).padStart(2, '0')}
              </div>
            </div>
          </div>
        )}

        {/* Reward Breakdown HUD */}
        <div className="bg-[#070809] border border-[#1C2128] p-4 mb-5 space-y-2.5">
          <div className="text-[11px] text-[#73777D] tracking-widest uppercase border-b border-[#15191F] pb-1.5 flex items-center justify-between">
            <span>{t.missionHUD.bountyRecap}</span>
            <span>DATA LOG #M{mission.order}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#A0A6B0]">
            <span>{t.missionHUD.baseBounty}</span>
            <span className="text-[#E6E6E6]">+{mission.xp} XP</span>
          </div>

          {xpEarned < mission.xp && (
            <div className="flex items-center justify-between text-xs text-[#FF5C5C]">
              <span>{t.missionHUD.hintPenalty}</span>
              <span>-{mission.xp - xpEarned} XP</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm font-bold text-[#7CFF6B] pt-1.5 border-t border-[#191E24]">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#7CFF6B]" />
              {t.missionHUD.netXpEarned}
            </span>
            <span className="text-base tracking-wider">+{xpEarned} XP</span>
          </div>
        </div>

        {/* Unlocked Badges */}
        {newAchievements.length > 0 && (
          <div className="mb-5 space-y-2">
            <div className="text-[10px] text-[#FFC857] uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>{t.missionHUD.badgeUnlocked}</span>
            </div>
            {newAchievements.map((ach) => {
              const locAch = getAchievementText(ach.id);
              return (
                <div
                  key={ach.id}
                  className="p-2.5 bg-[#121813] border border-[#2B4B2E] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[#7CFF6B]">{locAch?.name || ach.name}</div>
                    <div className="text-[10px] text-[#848B96]">{locAch?.description || ach.description}</div>
                  </div>
                  <div className="text-[#FFC857] font-bold text-xs shrink-0 ml-2">
                    +{ach.xpReward} XP
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button variant="ghost" size="md" className="w-full sm:w-auto" onClick={onReplay}>
            <RotateCcw className="w-3.5 h-3.5" />
            {t.common.replay}
          </Button>

          {nextMissionId ? (
            <Link href={`/missions/${nextMissionId}`} className="w-full sm:flex-1">
              <Button variant="primary" size="md" className="w-full justify-center">
                <span>{t.common.nextMission}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/missions" className="w-full sm:flex-1">
              <Button variant="primary" size="md" className="w-full justify-center">
                <span>{t.common.viewMap}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
