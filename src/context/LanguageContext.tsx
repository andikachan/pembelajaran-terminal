'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  TRANSLATIONS,
  LOCALIZED_MISSIONS,
  LOCALIZED_LEVELS,
  LOCALIZED_ACHIEVEMENTS,
  LocalizedMissionText,
  LocalizedLevelText,
  LocalizedAchievementText,
} from '@/lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof TRANSLATIONS['en'];
  getMissionText: (missionId: string) => LocalizedMissionText | undefined;
  getLevelText: (levelId: number) => LocalizedLevelText | undefined;
  getAchievementText: (achievementId: string) => LocalizedAchievementText | undefined;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'tq_language_preference';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to 'id' (Bahasa Indonesia) as requested by the user!
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === 'en' || saved === 'id') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'id' ? 'en' : 'id';
    setLanguage(nextLang);
  };

  const t = TRANSLATIONS[language];

  const getMissionText = (missionId: string): LocalizedMissionText | undefined => {
    return LOCALIZED_MISSIONS[language][missionId] || LOCALIZED_MISSIONS['en'][missionId];
  };

  const getLevelText = (levelId: number): LocalizedLevelText | undefined => {
    return LOCALIZED_LEVELS[language][levelId] || LOCALIZED_LEVELS['en'][levelId];
  };

  const getAchievementText = (achievementId: string): LocalizedAchievementText | undefined => {
    return LOCALIZED_ACHIEVEMENTS[language][achievementId] || LOCALIZED_ACHIEVEMENTS['en'][achievementId];
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        getMissionText,
        getLevelText,
        getAchievementText,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
