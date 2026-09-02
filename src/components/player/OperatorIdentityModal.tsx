'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { X, UserCheck } from 'lucide-react';

export function OperatorIdentityModal({ onClose }: { onClose: () => void }) {
  const { profile, updateCallsign } = useGame();
  const [callsign, setCallsign] = useState(profile?.callsign || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim()) return;
    setIsSubmitting(true);
    await updateCallsign(callsign);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0D1013] border border-[#2B3540] p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#73777D] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 bg-[#7CFF6B]" />
          <h2 className="font-mono text-sm uppercase tracking-widest text-[#7CFF6B]">
            OPERATOR IDENTITY PROTOCOL
          </h2>
        </div>

        <p className="font-mono text-xs text-[#8F959E] mb-5 leading-relaxed">
          Configure your station handle. This callsign will be registered to local records and the global operator leaderboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-[#73777D] uppercase mb-1.5">
              CALLSIGN IDENTIFIER
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-mono text-xs text-[#525862]">OP_</span>
              <input
                type="text"
                value={callsign.startsWith('OP_') ? callsign.substring(3) : callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                maxLength={16}
                placeholder="NEO_KERNEL"
                className="w-full bg-[#070809] border border-[#262D36] focus:border-[#7CFF6B] pl-10 pr-3 py-2 text-white font-mono text-sm tracking-wider focus:outline-none"
                autoFocus
              />
            </div>
            <p className="font-mono text-[10px] text-[#555B64] mt-1">
              Max 16 characters (letters, numbers, underscore, hyphens).
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1C222A]">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || !callsign.trim()}>
              <UserCheck className="w-3.5 h-3.5" />
              CONFIRM IDENTITY
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
