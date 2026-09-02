import type { Metadata } from 'next';
import './globals.css';
import { GameProvider } from '@/context/GameContext';
import { SoundProvider } from '@/context/SoundContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { PlayerHUDHeader } from '@/components/player/PlayerHUDHeader';
import { CRTScanlineOverlay } from '@/components/ui/CRTScanlineOverlay';

export const metadata: Metadata = {
  title: 'Terminal Quest — Game-Based Linux Terminal Academy',
  description: 'Belajar perintah Linux/Unix Terminal interaktif dengan konsep game-based learning, simulasi filesystem sandbox, misi terstruktur, XP, dan pencapaian.',
  keywords: ['linux', 'terminal', 'bash', 'learning platform', 'gamified learning', 'coding game', 'belajar linux'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#08090A] text-[#E6E6E6] antialiased selection:bg-[#7CFF6B]/30 selection:text-white min-h-screen flex flex-col font-sans">
        <LanguageProvider>
          <SoundProvider>
            <GameProvider>
              <CRTScanlineOverlay />
              <PlayerHUDHeader />
              <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
                {children}
              </main>
            </GameProvider>
          </SoundProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
