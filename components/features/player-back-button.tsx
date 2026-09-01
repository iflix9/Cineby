'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';

interface PlayerBackButtonProps {
  href: string; // Keep href for backward compatibility, although we might not strictly need it if we replace pathname
  onClick?: () => void;
}

export function PlayerBackButton({ href, onClick }: PlayerBackButtonProps) {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  const handleInteraction = useCallback(() => {
    setIsVisible(true);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  }, []);

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [handleInteraction]);

  return (
    <>
      {!isVisible && (
        <div 
          className="absolute inset-0 z-[105]"
          onPointerMove={handleInteraction}
          onTouchStart={handleInteraction}
        />
      )}
      {onClick ? (
        <button 
          onClick={onClick}
          className={`fixed top-6 left-6 md:top-10 md:left-12 z-[110] w-11 h-11 rounded-full flex items-center justify-center bg-zinc-900/60 hover:bg-zinc-800/80 backdrop-blur-md border border-zinc-800/60 hover:border-red-500/50 text-zinc-300 hover:text-red-500 hover:scale-105 transition-all group/back duration-500 ease-in-out shadow-lg ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <Icons.chevronLeft className="w-5 h-5 text-zinc-300 group-hover/back:text-red-500 transition-colors group-hover/back:-translate-x-0.5" />
        </button>
      ) : (
        <Link 
          href={href}
          replace
          className={`fixed top-6 left-6 md:top-10 md:left-12 z-[110] w-11 h-11 rounded-full flex items-center justify-center bg-zinc-900/60 hover:bg-zinc-800/80 backdrop-blur-md border border-zinc-800/60 hover:border-red-500/50 text-zinc-300 hover:text-red-500 hover:scale-105 transition-all group/back duration-500 ease-in-out shadow-lg ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <Icons.chevronLeft className="w-5 h-5 text-zinc-300 group-hover/back:text-red-500 transition-colors group-hover/back:-translate-x-0.5" />
        </Link>
      )}
    </>
  );
}

