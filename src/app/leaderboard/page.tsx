'use client';

import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useLanguage } from '@/context/LanguageContext';
import { LeaderboardEntry } from '@/lib/types';
import { Trophy, Flame, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LeaderboardPage() {
  const { profile } = useGame();
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const url = profile ? `/api/leaderboard?userId=${profile.id}` : '/api/leaderboard';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.leaderboard || []);
      }
    } catch (e) {
      console.warn('Failed to fetch leaderboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [profile]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-mono pb-12">
      {/* Header */}
      <div className="bg-[#0B0D0F] border border-[#1E242C] p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-[#FFC857] uppercase tracking-widest mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>{t.leaderboard.tag}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            {t.leaderboard.title}
          </h1>
          <p className="text-xs text-[#8A9099] mt-0.5 max-w-md">
            {t.leaderboard.subtitle}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchLeaderboard}
          disabled={isLoading}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{t.leaderboard.refresh}</span>
        </Button>
      </div>

      {/* Leaderboard Table / Card List */}
      <div className="bg-[#080A0C] border border-[#1C2128]">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-4 py-2.5 bg-[#0F1216] border-b border-[#1E242B] text-[11px] text-[#73777D] font-bold uppercase tracking-wider">
          <div className="col-span-2 sm:col-span-1 text-center">{t.leaderboard.rank}</div>
          <div className="col-span-6 sm:col-span-5">{t.leaderboard.operatorCol}</div>
          <div className="col-span-2 text-center">{t.leaderboard.levelCol}</div>
          <div className="hidden sm:block sm:col-span-2 text-center">{t.leaderboard.streakCol}</div>
          <div className="col-span-2 sm:col-span-2 text-right">{t.leaderboard.totalXpCol}</div>
        </div>

        {/* Entries */}
        <div className="divide-y divide-[#15191F]">
          {entries.map((entry) => {
            const isMe = profile && entry.id === profile.id;

            return (
              <div
                key={entry.id}
                className={`grid grid-cols-12 px-4 py-3 items-center text-xs transition-colors ${
                  isMe
                    ? 'bg-[#121A14] border-l-2 border-[#7CFF6B]'
                    : 'hover:bg-[#0E1114]'
                }`}
              >
                {/* Rank */}
                <div className="col-span-2 sm:col-span-1 flex items-center justify-center font-bold">
                  {entry.rank === 1 ? (
                    <span className="w-6 h-6 rounded-full bg-[#3D2E0B] border border-[#FFC857] text-[#FFC857] flex items-center justify-center text-xs">
                      1
                    </span>
                  ) : entry.rank === 2 ? (
                    <span className="w-6 h-6 rounded-full bg-[#202730] border border-[#7C97B0] text-[#D0DBE5] flex items-center justify-center text-xs">
                      2
                    </span>
                  ) : entry.rank === 3 ? (
                    <span className="w-6 h-6 rounded-full bg-[#2E1D13] border border-[#B37446] text-[#DDA77D] flex items-center justify-center text-xs">
                      3
                    </span>
                  ) : (
                    <span className="text-[#5D6470]">#{entry.rank}</span>
                  )}
                </div>

                {/* Operator handle */}
                <div className="col-span-6 sm:col-span-5 flex items-center gap-2 truncate pr-2">
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 font-semibold text-white truncate">
                      <span className="truncate">{entry.callsign || entry.username}</span>
                      {isMe && (
                        <span className="text-[9px] bg-[#1B3821] text-[#7CFF6B] border border-[#305C37] px-1 py-0 font-bold shrink-0">
                          {t.leaderboard.you}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#616773] truncate">
                      {entry.badge || 'OPERATOR'} • {entry.completedMissionsCount} {language === 'id' ? 'Misi' : 'Missions'}
                    </div>
                  </div>
                </div>

                {/* Level */}
                <div className="col-span-2 text-center">
                  <span className="px-2 py-0.5 bg-[#121519] border border-[#232932] text-[#FFC857] font-bold text-[11px]">
                    LVL {String(entry.level).padStart(2, '0')}
                  </span>
                </div>

                {/* Streak */}
                <div className="hidden sm:flex sm:col-span-2 items-center justify-center gap-1 text-[#C7CCD4]">
                  <Flame className="w-3.5 h-3.5 text-[#FFC857]" />
                  <span>{entry.streak}{language === 'id' ? 'h' : 'd'}</span>
                </div>

                {/* Total XP */}
                <div className="col-span-2 sm:col-span-2 text-right font-bold text-[#7CFF6B] tracking-wider">
                  {new Intl.NumberFormat('en-US').format(entry.xp)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
