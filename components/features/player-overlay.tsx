'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Player } from './player';
import { triggerAdPopUp } from '@/lib/ad';
import { isBlockedMedia } from '@/lib/tmdb';
import { Icons } from '@/components/ui/icons';

export interface TrailerData {
  trailerKey: string;
  title?: string;
  mediaInfo?: {
    type: 'movie' | 'tv';
    mediaId: string;
    season?: number;
    episode?: number;
  };
}

// Custom event to trigger full embed streaming playback
export const playMedia = (type: 'movie' | 'tv', mediaId: string, season?: number, episode?: number) => {
  if (isBlockedMedia(mediaId, type)) return;
  triggerAdPopUp();
  window.dispatchEvent(new CustomEvent('play-media', {
    detail: { type, mediaId, season, episode }
  }));
};

// Custom event to trigger trailer playback
export const playTrailer = (
  trailerKey: string,
  title?: string,
  mediaInfo?: { type: 'movie' | 'tv'; mediaId: string; season?: number; episode?: number }
) => {
  window.dispatchEvent(new CustomEvent('play-trailer', {
    detail: { trailerKey, title, mediaInfo }
  }));
};

export function PlayerOverlay() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [playing, setPlaying] = useState<{ type: 'movie' | 'tv'; mediaId: string; season?: number; episode?: number } | null>(null);
  const [trailerPlaying, setTrailerPlaying] = useState<TrailerData | null>(null);

  useEffect(() => {
    const isActive = !!playing || !!trailerPlaying;
    window.dispatchEvent(new CustomEvent('player-active', { detail: { active: isActive } }));
    return () => {
      window.dispatchEvent(new CustomEvent('player-active', { detail: { active: false } }));
    };
  }, [playing, trailerPlaying]);

  useEffect(() => {
    const handlePlay = (e: any) => {
      if (e.detail?.mediaId && isBlockedMedia(e.detail.mediaId, e.detail.type)) return;
      setTrailerPlaying(null);
      setPlaying(e.detail);
      document.body.style.overflow = 'hidden';
    };

    const handlePlayTrailer = (e: any) => {
      if (!e.detail?.trailerKey) return;
      setPlaying(null);
      setTrailerPlaying(e.detail);
      document.body.style.overflow = 'hidden';
    };

    window.addEventListener('play-media', handlePlay);
    window.addEventListener('play-trailer', handlePlayTrailer);
    return () => {
      window.removeEventListener('play-media', handlePlay);
      window.removeEventListener('play-trailer', handlePlayTrailer);
    };
  }, []);

  const handleClose = () => {
    setPlaying(null);
    document.body.style.overflow = 'auto';
    window.dispatchEvent(new CustomEvent('player-active', { detail: { active: false } }));
  };

  const handleCloseTrailer = () => {
    setTrailerPlaying(null);
    document.body.style.overflow = 'auto';
    window.dispatchEvent(new CustomEvent('player-active', { detail: { active: false } }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (trailerPlaying) {
          handleCloseTrailer();
        } else if (playing) {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trailerPlaying, playing]);

  if (trailerPlaying) {
    return (
      <div className="fixed inset-0 bg-black/95 z-[150] w-full h-full flex flex-col justify-between overflow-hidden backdrop-blur-md animate-in fade-in duration-200">
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between p-4 sm:p-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCloseTrailer}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_6px_rgba(0,0,0,0.4)] hover:ring-red-500/50 hover:from-zinc-800 hover:to-zinc-900 text-zinc-300 hover:text-red-500 transition-all duration-200 active:scale-95 group/back"
              title="Close Trailer"
              aria-label="Close Trailer"
            >
              <Icons.chevronLeft className="w-5 h-5 text-zinc-300 group-hover/back:text-red-500 transition-colors" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              {trailerPlaying.title && (
                <span className="text-white font-bold text-sm sm:text-base md:text-lg line-clamp-1 max-w-[180px] sm:max-w-md">
                  {trailerPlaying.title}
                </span>
              )}
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                Official Trailer
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {trailerPlaying.mediaInfo && (
              <button
                onClick={() => {
                  const info = trailerPlaying.mediaInfo;
                  handleCloseTrailer();
                  if (info) {
                    playMedia(info.type, info.mediaId, info.season, info.episode);
                  }
                }}
                className="bg-gradient-to-b from-white to-zinc-200 text-black ring-1 ring-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_2px_6px_rgba(0,0,0,0.3)] px-4 sm:px-5 py-2 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 hover:from-white hover:to-zinc-100 active:scale-95 transition-all duration-200"
                title="Watch full stream"
              >
                <Icons.play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" />
                <span className="hidden xs:inline">Stream Full Movie/Show</span>
                <span className="xs:hidden">Stream</span>
              </button>
            )}
            <button
              onClick={handleCloseTrailer}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
              title="Close"
              aria-label="Close"
            >
              <Icons.x className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Trailer Video Player */}
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-2 sm:py-6 flex items-center justify-center">
          <div className="w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerPlaying.trailerKey}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
              title={`${trailerPlaying.title || 'Media'} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        {/* Footer spacing */}
        <div className="h-4 sm:h-6" />
      </div>
    );
  }

  if (!playing) return null;

  return (
    <div className="fixed inset-0 bg-black z-[100] w-full h-full overflow-hidden">
      <Player
        type={playing.type}
        mediaId={playing.mediaId}
        season={playing.season}
        episode={playing.episode}
        onBack={handleClose}
        onEpisodeChange={(s, e) => {
          if (pathname && playing.type === 'tv') {
             router.replace(`/tv/${playing.mediaId}/${s}/${e}`, { scroll: false });
             setPlaying({ ...playing, season: s, episode: e });
          } else {
             setPlaying({ ...playing, season: s, episode: e });
          }
        }}
      />
    </div>
  );
}
