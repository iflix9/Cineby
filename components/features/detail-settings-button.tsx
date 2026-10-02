'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { SettingsModal } from './settings-modal';

interface DetailSettingsButtonProps {
  className?: string;
}

export function DetailSettingsButton({ className = '' }: DetailSettingsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_6px_rgba(0,0,0,0.4)] text-zinc-300 hover:text-white hover:ring-white/30 active:scale-95 transition-all duration-200 group/settings cursor-pointer ${className}`}
        title="Player Settings"
        aria-label="Player Settings"
      >
        <Settings className="w-5 h-5 text-zinc-300 group-hover/settings:text-white group-hover/settings:rotate-45 transition-all duration-300" />
      </button>

      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

