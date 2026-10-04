'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from '@/components/ui/icons';

interface TrailerFullscreenPlayerProps {
  trailerKey: string;
  title?: string;
  mediaInfo?: {
    type: 'movie' | 'tv';
    mediaId: string;
    season?: number;
    episode?: number;
  };
  onClose: () => void;
  onStreamMedia?: (type: 'movie' | 'tv', mediaId: string, season?: number, episode?: number) => void;
}

export function TrailerFullscreenPlayer({
  trailerKey,
  title,
  mediaInfo,
  onClose,
  onStreamMedia,
}: TrailerFullscreenPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  const handleInteraction = useCallback(() => {
    setIsControlsVisible(true);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsControlsVisible(false);
    }, 4000);
  }, []);

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setIsControlsVisible(false);
    }, 4000);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
      className="fixed inset-0 bg-black z-[150] w-full h-full overflow-hidden flex items-center justify-center select-none"
    >
      {/* Edge-to-Edge Fullscreen YouTube Player */}
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&playsinline=1`}
        title={`${title || 'Media'} Trailer`}
        className="w-full h-full border-0 absolute inset-0 z-0 bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />

      {/* Screen wake interaction area when controls are hidden */}
      {!isControlsVisible && (
        <div
          className="absolute inset-0 z-[140]"
          onPointerMove={handleInteraction}
          onTouchStart={handleInteraction}
        />
      )}

      {/* Top Ambient Contrast Scrim */}
      <div
        className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none z-[145] transition-opacity duration-500 ${
          isControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Top Navigation Bar */}
      <div
        className={`fixed top-4 sm:top-6 inset-x-4 sm:inset-x-8 md:inset-x-12 z-[150] flex items-center justify-between transition-all duration-500 ease-in-out pointer-events-none ${
          isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {/* Top-Left: Back Button Only */}
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_6px_rgba(0,0,0,0.4)] hover:ring-red-500/50 hover:from-zinc-800 hover:to-zinc-900 text-zinc-300 hover:text-red-500 transition-all duration-200 active:scale-95 group/back cursor-pointer"
            title="Exit Trailer"
            aria-label="Exit Trailer"
          >
            <Icons.chevronLeft className="w-5 h-5 text-zinc-300 group-hover/back:text-red-500 transition-colors group-hover/back:-translate-x-0.5" />
          </button>
        </div>

        {/* Top-Right: Stream Media CTA (Optional) */}
        {mediaInfo && onStreamMedia && (
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                onStreamMedia(
                  mediaInfo.type,
                  mediaInfo.mediaId,
                  mediaInfo.season,
                  mediaInfo.episode
                );
              }}
              className="bg-gradient-to-b from-white to-zinc-200 text-black ring-1 ring-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_2px_6px_rgba(0,0,0,0.3)] px-4 sm:px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 hover:from-white hover:to-zinc-100 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Stream full media"
            >
              <Icons.play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" />
              <span className="hidden xs:inline">Stream Full Movie/Show</span>
              <span className="xs:hidden">Stream</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
