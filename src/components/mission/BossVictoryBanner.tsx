'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Skull } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface BossVictoryBannerProps {
  xpEarned: number;
  onContinue: () => void;
}

export function BossVictoryBanner({ xpEarned, onContinue }: BossVictoryBannerProps) {
  const { t, language } = useLanguage();

  const titleText = language === 'id' ? 'BOSS DIKALAHKAN' : 'BOSS DEFEATED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg bg-[#0E0707] border-2 border-[#FF5C5C] p-6 shadow-[0_0_50px_rgba(255,92,92,0.3)] font-mono text-center"
      >
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-[#240C0C] border border-[#751E1E] text-[#FF5C5C]">
            <Skull className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Retro ASCII Banner */}
        <pre className="font-mono text-[#FF5C5C] text-xs sm:text-sm font-bold leading-none select-none my-4 mx-auto inline-block text-left">
{`╔═══════════════════════════════════════╗
║         ${titleText.padEnd(29, ' ')} ║
║                                       ║
║                +${String(xpEarned).padEnd(4, ' ')} XP                ║
╚═══════════════════════════════════════╝`}
        </pre>

        <p className="text-xs sm:text-sm text-[#D6B0B0] max-w-sm mx-auto mb-6 leading-relaxed">
          {t.missionHUD.bossSubtext}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/missions" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <Trophy className="w-4 h-4 text-[#7CFF6B]" />
              {t.common.returnToMap}
            </Button>
          </Link>
          <Link href="/profile" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              {t.common.profile}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
