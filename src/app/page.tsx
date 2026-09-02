'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSound } from '@/context/SoundContext';
import { useGame } from '@/context/GameContext';
import { Terminal, Shield, ArrowRight, Play, Map, Trophy, Compass, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { playKeyClick, playSubmit, playSuccess } = useSound();
  const { profile } = useGame();

  const [bootStep, setBootStep] = useState<number>(0);
  const [typedCommand, setTypedCommand] = useState<string>('');
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const bootLogs = [
    'initializing terminal quest microkernel...',
    'mounting virtual root filesystem [ext4]...',
    'loading command dictionary (pwd, ls, cd, grep, find, ps)...',
    'verifying operator access credentials...',
    'subsystem online. ready.',
  ];

  // Progressive fast boot animation (2-3 seconds)
  useEffect(() => {
    if (bootStep < bootLogs.length) {
      const timer = setTimeout(() => {
        setBootStep((prev) => prev + 1);
        playKeyClick();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [bootStep, playKeyClick]);

  const handleStartMission = () => {
    if (isStarting) return;
    setIsStarting(true);
    playSubmit();

    // Type animation for "boot terminal_quest --mission=01"
    const targetText = 'boot terminal_quest --init-training';
    let charIdx = 0;

    const interval = setInterval(() => {
      if (charIdx <= targetText.length) {
        setTypedCommand(targetText.substring(0, charIdx));
        playKeyClick();
        charIdx++;
      } else {
        clearInterval(interval);
        playSuccess();
        setTimeout(() => {
          router.push('/missions/mission-01');
        }, 400);
      }
    }, 45);
  };

  const handleSkipBoot = () => {
    setBootStep(bootLogs.length);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-6 font-mono">
      {/* Central Retro Terminal Window */}
      <div className="w-full max-w-2xl bg-[#050606] border-2 border-[#1E252D] shadow-2xl relative">
        {/* Terminal Header */}
        <div className="h-9 px-4 bg-[#0E1114] border-b border-[#1A1F26] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5C5C]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFC857]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#7CFF6B]/80" />
            <span className="ml-2 font-mono text-xs text-[#8A9099]">
              guest@station:~ [bootloader v2.4]
            </span>
          </div>

          {bootStep < bootLogs.length && (
            <button
              onClick={handleSkipBoot}
              className="text-[10px] text-[#73777D] hover:text-[#7CFF6B] uppercase tracking-wider transition-colors"
            >
              [ SKIP BOOT ]
            </button>
          )}
        </div>

        {/* Terminal Screen Body */}
        <div className="p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-[#E6E6E6] min-h-[340px] flex flex-col justify-between">
          {/* Boot sequence logs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#7CFF6B] font-bold">
              <span>$</span>
              <span>boot terminal_quest</span>
            </div>

            <div className="space-y-1 text-[#8A9099] font-mono text-xs pl-2 border-l border-[#1C2128]">
              {bootLogs.slice(0, bootStep).map((log, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-[#555B63]">[{String(index + 1).padStart(2, '0')}]</span>
                  <span className={index === bootLogs.length - 1 ? 'text-[#7CFF6B] font-bold' : ''}>
                    « {log} »
                  </span>
                </div>
              ))}
            </div>

            {/* Welcome banner when boot ready */}
            {bootStep >= bootLogs.length && (
              <div className="pt-4 space-y-3 animate-fadeIn">
                <div className="text-white text-base sm:text-lg font-bold tracking-wider">
                  WELCOME, OPERATOR.
                </div>
                <p className="text-[#A2A8B3] text-xs sm:text-sm leading-relaxed max-w-lg">
                  Your Linux terminal journey begins here. Learn navigation, file manipulation, pattern extraction, and system daemons through hands-on simulated missions.
                </p>

                {isStarting && (
                  <div className="pt-2 flex items-center gap-2 text-[#7CFF6B] font-bold">
                    <span>$</span>
                    <span>{typedCommand}</span>
                    <span className="animate-blink">█</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          {bootStep >= bootLogs.length && !isStarting && (
            <div className="pt-6 border-t border-[#181D24] flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleStartMission}
                className="w-full sm:w-auto px-6 py-3 bg-[#132216] border-2 border-[#7CFF6B] text-[#7CFF6B] hover:bg-[#1B331F] hover:shadow-[0_0_20px_rgba(124,255,107,0.3)] transition-all font-mono font-bold text-sm tracking-wider flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
                <span>START MISSION 01</span>
              </button>

              <Link href="/missions" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-5 py-3 bg-[#101317] border border-[#262E38] text-[#C4C9D1] hover:text-white hover:border-[#3C4754] transition-all font-mono text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer">
                  <Map className="w-4 h-4 text-[#FFC857]" />
                  <span>CAMPAIGN MAP</span>
                </button>
              </Link>
            </div>
          )}

          {bootStep < bootLogs.length && (
            <div className="pt-4 flex items-center gap-2 text-[#7CFF6B] text-xs">
              <span className="animate-blink">█</span>
              <span>SYNCHRONIZING ENVIRONMENT...</span>
            </div>
          )}
        </div>

        {/* Subtle Cyber Corner Accents */}
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#7CFF6B]" />
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#7CFF6B]" />
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#7CFF6B]" />
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#7CFF6B]" />
      </div>

      {/* Feature Micro-Badges */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full text-[11px] font-mono">
        <div className="p-2.5 bg-[#0C0E11] border border-[#1C2229] text-[#868C96] flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#7CFF6B] shrink-0" />
          <span>Real Sandbox VFS</span>
        </div>
        <div className="p-2.5 bg-[#0C0E11] border border-[#1C2229] text-[#868C96] flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FFC857] shrink-0" />
          <span>20 Progressive Ops</span>
        </div>
        <div className="p-2.5 bg-[#0C0E11] border border-[#1C2229] text-[#868C96] flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-[#4EE2EC] shrink-0" />
          <span>Global Leaderboard</span>
        </div>
        <div className="p-2.5 bg-[#0C0E11] border border-[#1C2229] text-[#868C96] flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#FF5C5C] shrink-0" />
          <span>Boss Challenges</span>
        </div>
      </div>
    </div>
  );
}
