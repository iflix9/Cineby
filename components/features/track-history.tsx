'use client';

import { useEffect } from 'react';
import { useHistory } from '@/hooks/use-history';

interface TrackHistoryProps {
  mediaId: string | number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  season?: number;
  episode?: number;
  episodeName?: string;
}

export function TrackHistory({
  mediaId,
  type,
  title,
  poster_path,
  backdrop_path,
  season,
  episode,
  episodeName,
}: TrackHistoryProps) {
  useEffect(() => {
    if (!mediaId || !title) return;

    useHistory.getState().addItem({
      mediaId: String(mediaId),
      type,
      title,
      poster_path,
      backdrop_path,
      season,
      episode,
      episodeName,
    });
  }, [mediaId, type, title, poster_path, backdrop_path, season, episode, episodeName]);

  return null;
}
