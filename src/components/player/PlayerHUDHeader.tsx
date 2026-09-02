'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { useSound } from '@/context/SoundContext';
import { calculateLevel, formatXp } from '@/lib/utils';
import { Volume2, VolumeX, Flame, Terminal, Map, Trophy, User, Code2, Edit2 } from 'lucide-react';
import { OperatorIdentityModal } from './OperatorIdentityModal';

export function PlayerHUDHeader() {
  const pathname = usePathname();
  const { profile } = useGame();
  const { soundEnabled, toggleSound } = useSound();
  const [showIdentityModal, setShowIdentityModal] = useState(false);

  const levelStats = calculateLevel(profile?.xp || 0);

  const navItems = [
    { href: '/play', label: 'TERMINAL', icon: Terminal },
    { href: '/missions', label: 'WORLD MAP', icon: Map },
    { href: '/sandbox', label: 'SANDBOX', icon: Code2 },
    { href: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
    { href: '/profile', label: 'PROFILE', icon: User },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0B0D0F]/90 backdrop-blur-md border-b border-[#1C2127]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group font-mono text-xs sm:text-sm font-bold tracking-widest text-[#E6E6E6] hover:text-[#7CFF6B] transition-colors"
            >
              <span className="w-2.5 h-2.5 bg-[#7CFF6B] shadow-[0_0_8px_#7CFF6B] inline-block" />
              <span className="text-[#7CFF6B]">TERMINAL</span>
              <span className="text-[#A4A8AD] group-hover:text-white transition-colors">QUEST</span>
              <span className="hidden md:inline-block text-[10px] text-[#555B63] px-1 py-0.5 border border-[#222830]">
                v2.4
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 font-mono text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/play'
                  ? pathname.startsWith('/play') || pathname.startsWith('/missions/')
                  : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all ${
                    isActive
                      ? 'bg-[#141A16] border-[#315735] text-[#7CFF6B]'
                      : 'border-transparent text-[#8A9099] hover:text-[#E6E6E6] hover:border-[#222830]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Player HUD Stats Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Operator Callsign */}
            <button
              onClick={() => setShowIdentityModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#101317] border border-[#232931] hover:border-[#7CFF6B]/50 transition-colors font-mono text-xs text-[#C8CDD3]"
              title="Change operator callsign"
            >
              <span className="w-1.5 h-1.5 bg-[#7CFF6B] rounded-full animate-pulse" />
              <span className="text-[#888E96]">OP:</span>
              <span className="font-semibold text-white truncate max-w-[90px] md:max-w-[120px]">
                {profile?.callsign || 'OPERATOR'}
              </span>
              <Edit2 className="w-3 h-3 text-[#5F656E] hover:text-white" />
            </button>

            {/* Level Badge */}
            <div className="flex items-center gap-1 px-2 py-1 bg-[#101317] border border-[#262C36] font-mono text-xs">
              <span className="text-[#FFC857] font-bold">LVL</span>
              <span className="text-white font-mono font-bold">{String(levelStats.level).padStart(2, '0')}</span>
            </div>

            {/* XP Mini Bar */}
            <div className="hidden md:flex flex-col gap-0.5 min-w-[110px]">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#73777D]">
                <span>XP</span>
                <span className="text-[#E6E6E6]">{formatXp(profile?.xp || 0)}</span>
              </div>
              <div className="w-full h-1.5 bg-[#14171B] border border-[#242A33] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3C7B38] to-[#7CFF6B] transition-all duration-300"
                  style={{ width: `${levelStats.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Streak */}
            <div
              className="flex items-center gap-1 px-2 py-1 bg-[#1A140B] border border-[#423114] text-[#FFC857] font-mono text-xs"
              title={`${profile?.streak || 1} Day Learning Streak`}
            >
              <Flame className="w-3.5 h-3.5 text-[#FFC857]" />
              <span className="font-bold">{profile?.streak || 1}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 border font-mono text-xs transition-colors ${
                soundEnabled
                  ? 'bg-[#152018] border-[#375B3D] text-[#7CFF6B]'
                  : 'bg-[#101215] border-[#22272E] text-[#636870] hover:text-[#9EA4AD]'
              }`}
              title={soundEnabled ? 'Mute Retro Audio' : 'Enable Retro Audio'}
              aria-label="Sound Toggle"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Subnavigation Bar */}
        <div className="lg:hidden border-t border-[#181D23] bg-[#0D1013] px-3 py-1 flex items-center justify-around font-mono text-[11px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/play'
                ? pathname.startsWith('/play') || pathname.startsWith('/missions/')
                : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 py-1 px-2 ${
                  isActive ? 'text-[#7CFF6B] font-bold' : 'text-[#73777D]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Operator Identity Modal */}
      {showIdentityModal && (
        <OperatorIdentityModal onClose={() => setShowIdentityModal(false)} />
      )}
    </>
  );
}
