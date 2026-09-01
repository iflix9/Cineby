'use client';

import { Icons } from '@/components/ui/icons';
import { playMedia } from './player-overlay';

interface PlayButtonProps {
  type: 'movie' | 'tv';
  mediaId: string;
  season?: number;
  episode?: number;
  className?: string;
  children?: React.ReactNode;
}

export function PlayButton({ type, mediaId, season, episode, className, children }: PlayButtonProps) {
  return (
    <button
      onClick={() => playMedia(type, mediaId, season, episode)}
      className={className}
    >
      {children || (
        <>
          <Icons.play className="w-5 h-5 fill-black" />
          <span>Play</span>
        </>
      )}
    </button>
  );
}
