'use client';

import { Film } from 'lucide-react';
import { playTrailer } from './player-overlay';

interface TrailerButtonProps {
  trailerKey: string;
  title: string;
  mediaInfo?: {
    type: 'movie' | 'tv';
    mediaId: string;
    season?: number;
    episode?: number;
  };
  className?: string;
  variant?: 'primary' | 'secondary' | 'badge';
}

export function TrailerButton({
  trailerKey,
  title,
  mediaInfo,
  className = '',
  variant = 'secondary',
}: TrailerButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playTrailer(trailerKey, title, mediaInfo);
  };

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all cursor-pointer ${className}`}
        title={`Watch ${title} Trailer`}
      >
        <Film className="w-3.5 h-3.5" />
        <span>Watch Trailer</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_6px_rgba(0,0,0,0.3)] text-white font-medium text-[14px] md:text-[15px] px-5 py-2.5 rounded-full flex items-center justify-center gap-2 hover:from-white/15 hover:to-white/10 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 shrink-0 h-[46px] cursor-pointer group/trailer ${className}`}
      title={`Watch ${title} Official Trailer`}
      aria-label={`Watch ${title} Official Trailer`}
    >
      <Film className="w-4 h-4 text-zinc-300 group-hover/trailer:text-white transition-colors" />
      <span>Trailer</span>
    </button>
  );
}
