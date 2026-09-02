import type { Metadata } from 'next';
import './globals.css';
import { GameProvider } from '@/context/GameContext';
import { SoundProvider } from '@/context/SoundContext';
import { PlayerHUDHeader } from '@/components/player/PlayerHUDHeader';
import { CRTScanlineOverlay } from '@/components/ui/CRTScanlineOverlay';

export const metadata: Metadata = {
  title: 'Terminal Quest — Learn Linux Commands by Playing',
  description: 'Learn Linux/Unix terminal commands through interactive gamified missions, challenges, and a realistic simulated terminal sandbox.',
  keywords: ['linux', 'terminal', 'bash', 'learning platform', 'gamified learning', 'coding game'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#08090A] text-[#E6E6E6] antialiased selection:bg-[#7CFF6B]/30 selection:text-white min-h-screen flex flex-col font-sans">
        <SoundProvider>
          <GameProvider>
            <CRTScanlineOverlay />
            <PlayerHUDHeader />
            <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
              {children}
            </main>
          </GameProvider>
        </SoundProvider>
      </body>
    </html>
  );
}
