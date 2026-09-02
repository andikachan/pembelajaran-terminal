'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundFx } from '@/lib/sound';

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playKeyClick: () => void;
  playSubmit: () => void;
  playError: () => void;
  playSuccess: () => void;
  playBossVictory: () => void;
  playUnlock: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  useEffect(() => {
    const isSaved = localStorage.getItem('tq_sound_enabled') === 'true';
    setSoundEnabled(isSaved);
    soundFx.setEnabled(isSaved);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.setEnabled(next);
    if (next) {
      soundFx.playSuccess();
    }
  };

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        playKeyClick: () => soundFx.playKeyClick(),
        playSubmit: () => soundFx.playSubmit(),
        playError: () => soundFx.playError(),
        playSuccess: () => soundFx.playSuccess(),
        playBossVictory: () => soundFx.playBossVictory(),
        playUnlock: () => soundFx.playUnlock(),
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    return {
      soundEnabled: false,
      toggleSound: () => {},
      playKeyClick: () => {},
      playSubmit: () => {},
      playError: () => {},
      playSuccess: () => {},
      playBossVictory: () => {},
      playUnlock: () => {},
    };
  }
  return ctx;
}
