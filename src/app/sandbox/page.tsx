'use client';

import React, { useState } from 'react';
import { VirtualFileSystem } from '@/lib/vfs/VirtualFileSystem';
import { Terminal } from '@/components/terminal/Terminal';
import { VirtualFileSystemTree } from '@/components/terminal/VirtualFileSystemTree';
import { Code2, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

export default function SandboxPage() {
  const [vfs, setVfs] = useState<VirtualFileSystem>(() => new VirtualFileSystem());
  const [vfsVersion, setVfsVersion] = useState(0);
  const { t, language } = useLanguage();

  const handleReset = () => {
    const newVfs = new VirtualFileSystem();
    setVfs(newVfs);
    setVfsVersion((v) => v + 1);
  };

  const initialLines = [
    {
      id: 'sand-1',
      type: 'system' as const,
      text: language === 'id'
        ? 'LINGKUNGAN TERMINAL SANDBOX // MODE BEBAS'
        : 'SANDBOX TERMINAL ENVIRONMENT // UNRESTRICTED MODE',
    },
    {
      id: 'sand-2',
      type: 'system' as const,
      text: language === 'id'
        ? "Coba berbagai perintah Linux bebas: ls, cd, mkdir, touch, cat, grep, find, ps, kill, dll."
        : "Test any Linux commands freely: ls, cd, mkdir, touch, cat, grep, find, ps, kill, etc.",
    },
  ];

  return (
    <div className="space-y-4 font-mono max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-[#0B0D0F] border border-[#1E242C] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-[#4EE2EC] uppercase tracking-widest mb-1">
            <Code2 className="w-3.5 h-3.5" />
            <span>{t.sandbox.tag}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white">
            {t.sandbox.title}
          </h1>
          <p className="text-xs text-[#8A9099] mt-0.5">
            {t.sandbox.subtitle}
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={handleReset} className="self-start sm:self-auto">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.sandbox.resetFs}</span>
        </Button>
      </div>

      {/* Grid: Terminal (Left) & VFS Observer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8">
          <Terminal
            key={`sandbox-term-${vfsVersion}`}
            vfs={vfs}
            initialLines={initialLines}
            onVfsChange={() => setVfsVersion((v) => v + 1)}
            className="h-[520px]"
          />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <VirtualFileSystemTree
            key={`sandbox-tree-${vfsVersion}`}
            root={vfs.getSnapshot().root}
            currentPath={vfs.getCwd()}
          />

          <div className="bg-[#0B0D0F] border border-[#1E242C] p-4 text-xs space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#FFC857] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.sandbox.examples}</span>
            </div>

            <div className="space-y-2 text-[#9EA4AD]">
              <div>
                <span className="text-[#7CFF6B] font-bold">mkdir -p src/utils</span>
                <p className="text-[11px] text-[#73777D]">
                  {language === 'id' ? 'Membuat direktori bertingkat secara rekursif' : 'Creates nested directories recursively'}
                </p>
              </div>
              <div>
                <span className="text-[#7CFF6B] font-bold">echo &quot;hello world&quot; &gt; note.txt</span>
                <p className="text-[11px] text-[#73777D]">
                  {language === 'id' ? 'Menulis output teks langsung ke berkas baru' : 'Outputs text directly into a new file'}
                </p>
              </div>
              <div>
                <span className="text-[#7CFF6B] font-bold">cat note.txt | grep &quot;world&quot;</span>
                <p className="text-[11px] text-[#73777D]">
                  {language === 'id' ? 'Mengarahkan isi file ke penyaring teks' : 'Pipes content through text search'}
                </p>
              </div>
              <div>
                <span className="text-[#7CFF6B] font-bold">find . -name &quot;*.txt&quot;</span>
                <p className="text-[11px] text-[#73777D]">
                  {language === 'id' ? 'Mencari semua berkas yang cocok secara rekursif' : 'Recursively finds all matching files'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
