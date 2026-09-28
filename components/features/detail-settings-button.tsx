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
        className={`w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_6px_rgba(0,0,0,0.3)] text-white hover:from-white/15 hover:to-white/10 hover:ring-white/20 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 group/settings ${className}`}
        title="Player Settings"
        aria-label="Player Settings"
      >
        <Settings className="w-5 h-5 text-white/90 group-hover/settings:text-white group-hover/settings:rotate-45 transition-all duration-300" />
      </button>

      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

