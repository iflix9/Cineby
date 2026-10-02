'use client';

import { useState, useEffect } from 'react';
import { Player } from './player';
import { TrailerFullscreenPlayer } from './trailer-fullscreen-player';
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
      <TrailerFullscreenPlayer
        trailerKey={trailerPlaying.trailerKey}
        title={trailerPlaying.title}
        mediaInfo={trailerPlaying.mediaInfo}
        onClose={handleCloseTrailer}
        onStreamMedia={(type, mediaId, season, episode) => {
          handleCloseTrailer();
          playMedia(type, mediaId, season, episode);
        }}
      />
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
          setPlaying(prev => prev ? { ...prev, season: s, episode: e } : null);
        }}
      />
    </div>
  );
}
