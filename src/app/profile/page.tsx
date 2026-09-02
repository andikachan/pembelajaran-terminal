'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useLanguage } from '@/context/LanguageContext';
import { ACHIEVEMENTS } from '@/data/achievements';
import { MISSIONS } from '@/data/missions';
import { calculateLevel, formatXp } from '@/lib/utils';
import { AchievementBadge } from '@/components/player/AchievementBadge';
import { OperatorIdentityModal } from '@/components/player/OperatorIdentityModal';
import { Button } from '@/components/ui/Button';
import {
  User,
  Zap,
  Flame,
  Award,
  Terminal,
  RotateCcw,
  CheckCircle2,
  Edit2,
  Download,
} from 'lucide-react';

export default function ProfilePage() {
  const { profile, resetProgress } = useGame();
  const { t, language } = useLanguage();
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const levelStats = calculateLevel(profile?.xp || 0);

  const unlockedCount = profile?.unlockedAchievements.length || 0;
  const missionsDone = profile?.completedMissions.length || 0;
  const totalMissions = MISSIONS.length;

  const handleExportData = () => {
    if (!profile) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `terminal_quest_${profile.callsign}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 font-mono pb-16">
      {/* Operator Main Dossier HUD */}
      <div className="bg-[#090C0E] border-2 border-[#1E252E] p-4 sm:p-6 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Callsign */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 bg-[#101418] border-2 border-[#7CFF6B] text-[#7CFF6B] flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(124,255,107,0.2)] shrink-0">
              <User className="w-8 h-8" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#73777D] tracking-widest uppercase">
                  {t.profile.callsignLabel}
                </span>
                <button
                  onClick={() => setShowIdentityModal(true)}
                  className="text-[#5B626E] hover:text-[#7CFF6B] transition-colors"
                  title="Edit callsign"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider truncate">
                {profile?.callsign || 'OPERATOR'}
              </h1>

              <div className="flex items-center gap-3 text-xs text-[#888E99]">
                <span>ID: {profile?.id}</span>
                <span>•</span>
                <span className="text-[#FFC857]">
                  {profile?.level && profile.level >= 10 ? 'VETERAN' : 'TRAINEE'}
                </span>
              </div>
            </div>
          </div>

          {/* Level Badge & XP Gauge */}
          <div className="bg-[#0E1216] border border-[#232932] p-4 min-w-[240px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#73777D] font-bold">{t.profile.rankLabel}</span>
              <span className="text-xs text-[#FFC857] font-bold">
                LEVEL {String(levelStats.level).padStart(2, '0')}
              </span>
            </div>

            <div className="w-full h-2.5 bg-[#14181D] border border-[#27303B] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#29542D] to-[#7CFF6B] transition-all duration-300"
                style={{ width: `${levelStats.progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#8A919C]">
              <span>{t.profile.currentLevelXp}</span>
              <span className="font-bold text-white">
                {formatXp(levelStats.currentLevelXp)} / {formatXp(levelStats.nextLevelXp)}
              </span>
            </div>
          </div>
        </div>

        {/* Cyber Corner Accents */}
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#7CFF6B]" />
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#7CFF6B]" />
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#7CFF6B]" />
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#7CFF6B]" />
      </div>

      {/* Grid of Key Metrics HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[#0A0C0E] border border-[#1C2128] space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-[#73777D] uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-[#7CFF6B]" />
            <span>{t.profile.totalXp}</span>
          </div>
          <div className="text-xl font-bold text-white">
            {formatXp(profile?.xp || 0)}
          </div>
          <div className="text-[10px] text-[#555B64]">{t.profile.accumulatedScore}</div>
        </div>

        <div className="p-4 bg-[#0A0C0E] border border-[#1C2128] space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-[#73777D] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4EE2EC]" />
            <span>{t.profile.missionsCleared}</span>
          </div>
          <div className="text-xl font-bold text-white">
            {missionsDone} / {totalMissions}
          </div>
          <div className="text-[10px] text-[#555B64]">
            {Math.round((missionsDone / totalMissions) * 100)}% {t.profile.academyCompleted}
          </div>
        </div>

        <div className="p-4 bg-[#0A0C0E] border border-[#1C2128] space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-[#73777D] uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-[#FFC857]" />
            <span>{t.profile.stationStreak}</span>
          </div>
          <div className="text-xl font-bold text-white">
            {profile?.streak || 1} {t.common.days}
          </div>
          <div className="text-[10px] text-[#555B64]">{t.profile.continuousTraining}</div>
        </div>

        <div className="p-4 bg-[#0A0C0E] border border-[#1C2128] space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-[#73777D] uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5 text-[#B388FF]" />
            <span>{t.profile.commandsFired}</span>
          </div>
          <div className="text-xl font-bold text-white">
            {profile?.commandCount || 0}
          </div>
          <div className="text-[10px] text-[#555B64]">{t.profile.shellLogged}</div>
        </div>
      </div>

      {/* Collectible Badges / Achievements Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E242C] pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FFC857]" />
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">
              {t.profile.trophiesTitle} ({unlockedCount}/{ACHIEVEMENTS.length})
            </h2>
          </div>
          <span className="text-[11px] text-[#868C96]">
            {Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}% {t.profile.unlocked}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = profile?.unlockedAchievements.includes(achievement.id);
            return (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked={isUnlocked}
              />
            );
          })}
        </div>
      </div>

      {/* Save Data Operations */}
      <div className="p-4 bg-[#0B0D0F] border border-[#1D2228] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {t.profile.backupTitle}
          </h3>
          <p className="text-[11px] text-[#73777D] mt-0.5">
            {t.profile.backupDesc}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportData}>
            <Download className="w-3.5 h-3.5" />
            <span>{t.profile.exportSave}</span>
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.profile.resetProgress}</span>
          </Button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0F0808] border-2 border-[#FF5C5C] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#FF5C5C] uppercase tracking-wider">
              {t.profile.confirmResetTitle}
            </h3>
            <p className="text-xs text-[#D9B5B5] leading-relaxed">
              {t.profile.confirmResetDesc}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#331414]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsResetConfirmOpen(false)}
              >
                {t.common.cancel}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  await resetProgress();
                  setIsResetConfirmOpen(false);
                }}
              >
                {t.profile.confirmWipe}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Identity Modal */}
      {showIdentityModal && (
        <OperatorIdentityModal onClose={() => setShowIdentityModal(false)} />
      )}
    </div>
  );
}
