'use client';

import { useState } from 'react';
import { Icons } from '@/components/ui/icons';
import { playMedia, playTrailer } from './player-overlay';
import { useCustomSources } from '@/hooks/use-custom-sources';

interface PlayButtonProps {
  type: 'movie' | 'tv';
  mediaId: string;
  season?: number;
  episode?: number;
  trailerKey?: string | null;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PlayButton({
  type,
  mediaId,
  season,
  episode,
  trailerKey,
  title,
  className,
  children,
}: PlayButtonProps) {
  const { streamingMode } = useCustomSources();
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If Streaming Mode is ON, play the embed player
    if (streamingMode) {
      playMedia(type, mediaId, season, episode);
      return;
    }

    // If Streaming Mode is OFF, play the trailer
    if (trailerKey) {
      playTrailer(trailerKey, title, { type, mediaId, season, episode });
      return;
    }

    // Otherwise, fetch trailer dynamically
    setIsLoadingTrailer(true);
    try {
      const res = await fetch(`/api/tmdb/${type}/${mediaId}/videos`);
      if (res.ok) {
        const data = await res.json();
        const found =
          data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') ||
          data.results?.find((v: any) => v.site === 'YouTube');

        if (found?.key) {
          playTrailer(found.key, title, { type, mediaId, season, episode });
          return;
        }
      }
      // If no trailer was found, fallback to embed streaming
      playMedia(type, mediaId, season, episode);
    } catch (err) {
      playMedia(type, mediaId, season, episode);
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  return (
    <button
      onClick={handlePlayClick}
      disabled={isLoadingTrailer}
      className={className}
      title={streamingMode ? 'Play Stream' : 'Play Trailer'}
    >
      {isLoadingTrailer ? (
        <span className="flex items-center gap-2">
          <Icons.spinner className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </span>
      ) : (
        children || (
          <>
            <Icons.play className="w-5 h-5 fill-black" />
            <span>Play</span>
          </>
        )
      )}
    </button>
  );
}

