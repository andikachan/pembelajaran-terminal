'use client';

import React, { useState } from 'react';

export function CRTScanlineOverlay() {
  const [enabled, setEnabled] = useState(true);

  if (!enabled) return null;

  return (
    <>
      {/* Subtle CRT Scanlines */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-30 crt-overlay" 
      />
      {/* Subtle screen edge vignette */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-40 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" 
      />
    </>
  );
}
