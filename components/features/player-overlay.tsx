'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Player } from './player';
import { PlayerBackButton } from './player-back-button';
import { triggerAdPopUp } from '@/lib/ad';
import { isBlockedMedia } from '@/lib/tmdb';

// We can use a custom event to trigger the player from anywhere
export const playMedia = (type: 'movie' | 'tv', mediaId: string, season?: number, episode?: number) => {
  if (isBlockedMedia(mediaId, type)) return;
  triggerAdPopUp();
  window.dispatchEvent(new CustomEvent('play-media', {
    detail: { type, mediaId, season, episode }
  }));
};

export function PlayerOverlay() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [playing, setPlaying] = useState<{ type: 'movie' | 'tv'; mediaId: string; season?: number; episode?: number } | null>(null);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('player-active', { detail: { active: !!playing } }));
    return () => {
      window.dispatchEvent(new CustomEvent('player-active', { detail: { active: false } }));
    };
  }, [playing]);

  useEffect(() => {
    const handlePlay = (e: any) => {
      if (e.detail?.mediaId && isBlockedMedia(e.detail.mediaId, e.detail.type)) return;
      setPlaying(e.detail);
      document.body.style.overflow = 'hidden';
    };

    window.addEventListener('play-media', handlePlay);
    return () => {
      window.removeEventListener('play-media', handlePlay);
    };
  }, []);

  const handleClose = () => {
    setPlaying(null);
    document.body.style.overflow = 'auto';
    window.dispatchEvent(new CustomEvent('player-active', { detail: { active: false } }));
  };

  if (!playing) return null;

  return (
    <div className="fixed inset-0 bg-black z-[100] w-full h-full overflow-hidden">
      <PlayerBackButton href="#" onClick={handleClose} />
      <Player
        type={playing.type}
        mediaId={playing.mediaId}
        season={playing.season}
        episode={playing.episode}
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
