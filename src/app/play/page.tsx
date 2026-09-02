'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';

export default function PlayRouterPage() {
  const router = useRouter();
  const { profile, getNextMissionId, isLoading } = useGame();

  useEffect(() => {
    if (!isLoading) {
      const nextId = getNextMissionId();
      if (nextId) {
        router.replace(`/missions/${nextId}`);
      } else {
        router.replace('/missions/mission-01');
      }
    }
  }, [isLoading, profile, getNextMissionId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] font-mono text-center">
      <div className="w-4 h-4 bg-[#7CFF6B] animate-spin mb-4" />
      <div className="text-sm font-bold text-white tracking-widest">
        ROUTING TO ACTIVE CAMPAIGN SECTOR...
      </div>
      <div className="text-xs text-[#73777D] mt-1">
        Synchronizing operator trajectory
      </div>
    </div>
  );
}
