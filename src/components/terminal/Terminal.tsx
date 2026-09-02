'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TerminalOutputLine } from '@/lib/types';
import { VirtualFileSystem } from '@/lib/vfs/VirtualFileSystem';
import { executeVirtualCommand, CommandExecutionResult } from '@/lib/vfs/commandInterpreter';
import { useSound } from '@/context/SoundContext';
import { Terminal as TerminalIcon, CornerDownLeft, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

interface TerminalProps {
  vfs: VirtualFileSystem;
  onExecuteCommand?: (result: CommandExecutionResult) => void;
  initialLines?: TerminalOutputLine[];
  onVfsChange?: () => void;
  readOnly?: boolean;
  className?: string;
  autoFocus?: boolean;
}

const KNOWN_COMMANDS = [
  'pwd',
  'whoami',
  'id',
  'su',
  'sudo',
  'hostname',
  'exit',
  'ls',
  'cd',
  'mkdir',
  'touch',
  'cat',
  'echo',
  'cp',
  'mv',
  'rm',
  'grep',
  'find',
  'head',
  'tail',
  'wc',
  'sort',
  'chmod',
  'chown',
  'ps',
  'kill',
  'ping',
  'curl',
  'clear',
  'help',
  'history',
  'reset',
];

export function Terminal({
  vfs,
  onExecuteCommand,
  initialLines,
  onVfsChange,
  readOnly = false,
  className = '',
  autoFocus = true,
}: TerminalProps) {
  const [lines, setLines] = useState<TerminalOutputLine[]>(
    initialLines || [
      {
        id: 'init-1',
        type: 'system',
        text: 'Terminal Quest OS [Version 2.4.0 (Aegis)]',
      },
      {
        id: 'init-2',
        type: 'system',
        text: "Interactive training session connected. Type 'help' for command reference.",
      },
    ]
  );
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isMaximized, setIsMaximized] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playKeyClick, playSubmit, playError } = useSound();

  const prompt = vfs.getPromptDetails();
  const displayCwd = prompt.displayPath;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, input]);

  const handleContainerClick = () => {
    if (!readOnly && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    playKeyClick();

    // Ctrl + L (Clear screen)
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      setLines([]);
      return;
    }

    // Up Arrow (History back)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx < history.length) {
        setHistoryIndex(nextIdx);
        setInput(history[history.length - 1 - nextIdx]);
      }
      return;
    }

    // Down Arrow (History forward)
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[history.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
      return;
    }

    // Tab (Autocomplete)
    if (e.key === 'Tab') {
      e.preventDefault();
      handleAutocomplete();
      return;
    }

    // Enter (Submit command)
    if (e.key === 'Enter') {
      e.preventDefault();
      submitCommand(input);
    }
  };

  const handleAutocomplete = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    if (parts.length === 1) {
      // Autocomplete command name
      const prefix = parts[0];
      const matches = KNOWN_COMMANDS.filter((c) => c.startsWith(prefix));
      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        setLines((prev) => [
          ...prev,
          {
            id: `tab-${Date.now()}`,
            type: 'system',
            text: matches.join('   '),
          },
        ]);
      }
    } else {
      // Autocomplete file/dir name in current working directory
      const lastToken = parts[parts.length - 1];
      const items = vfs.listDir(vfs.getCwd()) || [];
      const matches = items.filter((item) => item.startsWith(lastToken));

      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        const isTargetDir = vfs.isDir(matches[0]);
        setInput(parts.join(' ') + (isTargetDir ? '/' : ' '));
      } else if (matches.length > 1) {
        setLines((prev) => [
          ...prev,
          {
            id: `tab-${Date.now()}`,
            type: 'system',
            text: matches.join('   '),
          },
        ]);
      }
    }
  };

  const submitCommand = (cmdText: string) => {
    const raw = cmdText.trim();
    const currentPrompt = vfs.getPromptDetails();

    if (!raw) {
      setLines((prev) => [
        ...prev,
        {
          id: `empty-${Date.now()}`,
          type: 'command',
          text: '',
          path: currentPrompt.displayPath,
          user: currentPrompt.user,
          hostname: currentPrompt.hostname,
          symbol: currentPrompt.symbol,
          isRoot: currentPrompt.isRoot,
        },
      ]);
      setInput('');
      return;
    }

    playSubmit();

    // Add to history
    setHistory((prev) => [...prev, raw]);
    setHistoryIndex(-1);
    setInput('');

    // Execute against virtual filesystem
    const result = executeVirtualCommand(raw, vfs);

    if (result.clearScreen) {
      setLines([]);
      onExecuteCommand?.(result);
      onVfsChange?.();
      return;
    }

    if (result.exitCode !== 0) {
      playError();
    }

    const newCommandEntry: TerminalOutputLine = {
      id: `cmd-${Date.now()}`,
      type: 'command',
      text: raw,
      path: currentPrompt.displayPath,
      user: currentPrompt.user,
      hostname: currentPrompt.hostname,
      symbol: currentPrompt.symbol,
      isRoot: currentPrompt.isRoot,
    };

    const newLines: TerminalOutputLine[] = [newCommandEntry];

    if (result.output) {
      newLines.push({
        id: `out-${Date.now()}`,
        type: result.exitCode === 0 ? 'output' : 'error',
        text: result.output,
      });
    }

    setLines((prev) => [...prev, ...newLines]);
    onExecuteCommand?.(result);
    onVfsChange?.();
  };

  const handleClear = () => {
    setLines([]);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`bg-[#050606] border border-[#1E242B] flex flex-col relative font-mono select-text transition-all ${
        isMaximized
          ? 'fixed inset-4 z-50 shadow-2xl border-[#364250]'
          : 'h-[440px] md:h-[500px]'
      } ${className}`}
    >
      {/* Terminal Title Bar */}
      <div className="h-9 px-3 bg-[#0D1013] border-b border-[#1A1F26] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5C5C]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFC857]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#7CFF6B]/80" />
          </div>
          <div className="flex items-center gap-1.5 ml-2 font-mono text-xs text-[#8A9099]">
            <TerminalIcon className="w-3.5 h-3.5 text-[#7CFF6B]" />
            <span className="font-semibold text-white">{prompt.user}@{prompt.hostname}:</span>
            <span className="text-[#FFC857]">{displayCwd}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="text-[10px] text-[#73777D] hover:text-white px-1.5 py-0.5 border border-[#222830] transition-colors"
            title="Clear output (Ctrl+L)"
          >
            CLEAR
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
            className="text-[#73777D] hover:text-white transition-colors"
            title={isMaximized ? 'Restore window' : 'Maximize terminal'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-1.5 font-mono text-xs sm:text-sm text-[#E6E6E6] leading-relaxed">
        {lines.map((line) => (
          <div key={line.id} className="break-words">
            {line.type === 'command' && (
              <div className="flex items-center gap-1.5 text-white">
                <span className="select-none font-bold text-xs sm:text-sm shrink-0">
                  <span className={line.isRoot ? 'text-[#FF5C5C]' : 'text-[#7CFF6B]'}>
                    {line.user || 'player'}
                  </span>
                  <span className="text-[#626973]">@</span>
                  <span className="text-[#4EE2EC]">{line.hostname || 'terminal-quest'}</span>
                  <span className="text-[#73777D]">:</span>
                  <span className="text-[#FFC857]">{line.path || '~'}</span>
                  <span className={line.isRoot ? 'text-[#FF5C5C]' : 'text-[#7CFF6B]'}>
                    {line.symbol || '$'}
                  </span>{' '}
                </span>
                <span className="font-semibold text-[#FFFFFF]">{line.text}</span>
              </div>
            )}
            {line.type === 'output' && (
              <pre className="text-[#D8DCE2] whitespace-pre-wrap font-mono pl-3 border-l border-[#20262E]/70 py-0.5">
                {line.text}
              </pre>
            )}
            {line.type === 'error' && (
              <pre className="text-[#FF5C5C] whitespace-pre-wrap font-mono pl-3 border-l border-[#592222] py-0.5">
                {line.text}
              </pre>
            )}
            {line.type === 'system' && (
              <div className="text-[#73777D] font-mono text-xs py-0.5 italic">
                {line.text}
              </div>
            )}
            {line.type === 'success' && (
              <div className="text-[#7CFF6B] font-mono text-xs py-0.5 font-semibold">
                {line.text}
              </div>
            )}
          </div>
        ))}

        {/* Live Prompt Line */}
        {!readOnly && (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="select-none font-bold shrink-0 text-xs sm:text-sm">
              <span className={prompt.isRoot ? 'text-[#FF5C5C] animate-pulse font-extrabold' : 'text-[#7CFF6B]'}>
                {prompt.user}
              </span>
              <span className="text-[#626973]">@</span>
              <span className="text-[#4EE2EC]">{prompt.hostname}</span>
              <span className="text-[#73777D]">:</span>
              <span className="text-[#FFC857]">{prompt.displayPath}</span>
              <span className={prompt.isRoot ? 'text-[#FF5C5C] font-extrabold' : 'text-[#7CFF6B]'}>
                {prompt.symbol}
              </span>{' '}
            </span>
            <div className="relative flex-1 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                className="w-full bg-transparent text-white focus:outline-none font-mono text-xs sm:text-sm p-0 m-0 caret-transparent"
              />
              {/* Custom Retro Block Cursor */}
              <span
                className="absolute text-[#7CFF6B] animate-blink font-bold pointer-events-none select-none text-xs sm:text-sm"
                style={{
                  left: `${input.length * 8.4}px`,
                }}
              >
                █
              </span>
            </div>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer Quick Bar */}
      <div className="h-6 px-3 bg-[#080A0C] border-t border-[#161B21] flex items-center justify-between text-[10px] text-[#555B64] font-mono select-none">
        <div className="flex items-center gap-3">
          <span>TAB: Autocomplete</span>
          <span>UP/DOWN: History</span>
          <span>CTRL+L: Clear</span>
        </div>
        <div>
          <span className="text-[#7CFF6B]">● ONLINE</span>
        </div>
      </div>
    </div>
  );
}
