'use client';

import React, { useState } from 'react';
import { MissionHint } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { HelpCircle, AlertTriangle, Eye } from 'lucide-react';

interface HintDrawerProps {
  hints: MissionHint[];
  hintsRevealed: number;
  onRevealHint: (hintIndex: number) => void;
  currentXpReward: number;
}

export function HintDrawer({
  hints,
  hintsRevealed,
  onRevealHint,
  currentXpReward,
}: HintDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const canRevealNext = hintsRevealed < hints.length;
  const nextHint = canRevealNext ? hints[hintsRevealed] : null;

  return (
    <div className="bg-[#0B0D0F] border border-[#1E242B] font-mono text-xs">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-2 bg-[#111418] border-b border-[#1C2229] cursor-pointer text-[#8A9099] hover:text-[#E6E6E6]"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-[#FFC857]" />
          <span className="font-semibold text-white tracking-wider text-[11px] uppercase">
            HINT SYSTEM ({hintsRevealed}/{hints.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#FFC857] font-semibold">
            REWARD: +{currentXpReward} XP
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 space-y-3">
          {hintsRevealed === 0 && (
            <p className="text-[11px] text-[#73777D] leading-relaxed italic">
              Need assistance? Revealing hints will deduct XP from the mission bounty.
            </p>
          )}

          {/* List revealed hints */}
          {hints.slice(0, hintsRevealed).map((hint, idx) => (
            <div
              key={hint.id}
              className="p-2.5 bg-[#14181E] border border-[#27303B] text-[#D4D8E0] space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-[#FFC857]">
                <span>HINT #{idx + 1}</span>
                <span className="text-[#FF5C5C]">-{hint.xpPenalty} XP</span>
              </div>
              <p className="text-xs text-[#E6E6E6]">{hint.text}</p>
            </div>
          ))}

          {/* Button to unlock next hint */}
          {canRevealNext && nextHint && (
            <div className="pt-1">
              <Button
                variant="amber"
                size="sm"
                className="w-full flex items-center justify-center gap-2 text-xs"
                onClick={() => onRevealHint(hintsRevealed)}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  REVEAL HINT {hintsRevealed + 1} (-{nextHint.xpPenalty} XP)
                </span>
              </Button>
            </div>
          )}

          {hintsRevealed >= hints.length && (
            <div className="text-[10px] text-[#5A606A] text-center font-mono">
              All tactical hints for this mission have been unlocked.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
