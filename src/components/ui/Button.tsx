'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useSound } from '@/context/SoundContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const { playKeyClick } = useSound();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      playKeyClick();
      onClick?.(e);
    }
  };

  const variants = {
    primary:
      'bg-[#121E14] text-[#7CFF6B] border border-[#2B542C] hover:bg-[#1A2D1D] hover:border-[#7CFF6B] active:bg-[#203823] shadow-sm',
    secondary:
      'bg-[#101214] text-[#E6E6E6] border border-[#232930] hover:bg-[#171B1F] hover:border-[#3E4752] active:bg-[#1E2328]',
    amber:
      'bg-[#241A0B] text-[#FFC857] border border-[#523C16] hover:bg-[#33240F] hover:border-[#FFC857] active:bg-[#3D2C12]',
    danger:
      'bg-[#261010] text-[#FF5C5C] border border-[#592222] hover:bg-[#381616] hover:border-[#FF5C5C] active:bg-[#471B1B]',
    ghost:
      'bg-transparent text-[#73777D] hover:text-[#E6E6E6] border border-transparent hover:border-[#232930]',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs font-mono tracking-wider',
    md: 'px-4 py-2 text-sm font-mono tracking-wider',
    lg: 'px-6 py-3 text-base font-mono tracking-wider font-semibold',
  };

  return (
    <button
      className={cn(
        'btn-game inline-flex items-center justify-center gap-2 select-none uppercase font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-[#7CFF6B]/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
