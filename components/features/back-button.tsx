'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';

interface BackButtonProps {
  isModal?: boolean;
}

export function BackButton({ isModal }: BackButtonProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPlayerActive, setIsPlayerActive] = useState(false);

  useEffect(() => {
    const handlePlayerActive = (e: Event) => {
      const customEvt = e as CustomEvent<{ active: boolean }>;
      setIsPlayerActive(!!customEvt.detail?.active);
    };
    window.addEventListener('player-active', handlePlayerActive);
    return () => {
      window.removeEventListener('player-active', handlePlayerActive);
    };
  }, []);

  const isPlayInUrl = searchParams?.get('play') === 'true';
  if (isPlayInUrl || isPlayerActive) {
    return null;
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="fixed top-4 sm:top-6 left-4 sm:left-6 md:left-8 z-[70] w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-b from-white/[0.14] via-[#101115]/85 to-[#0b0c0e]/95 backdrop-blur-3xl saturate-150 border border-white/20 ring-1 ring-black/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.3),_0_20px_50px_rgba(0,0,0,0.7),_0_2px_8px_rgba(0,0,0,0.4)] hover:border-red-500/50 hover:from-white/20 text-zinc-300 hover:text-white transition-all duration-200 active:scale-95 group/back cursor-pointer"
      title="Go back"
      aria-label="Go back"
    >
      <Icons.chevronLeft className="w-5 h-5 text-zinc-300 group-hover/back:text-white transition-colors group-hover/back:-translate-x-0.5" />
    </button>
  );
}

