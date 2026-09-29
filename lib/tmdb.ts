import { cache } from 'react';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const BLOCKED_MOVIE_IDS: number[] = [];
export const BLOCKED_TV_IDS: number[] = [];

export function isBlockedMedia(id: number | string, type: string = 'movie'): boolean {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(numericId)) return false;
  if (type === 'movie') {
    return BLOCKED_MOVIE_IDS.includes(numericId);
  }
  if (type === 'tv') {
    return BLOCKED_TV_IDS.includes(numericId);
  }
  return BLOCKED_MOVIE_IDS.includes(numericId) || BLOCKED_TV_IDS.includes(numericId);
}

export const fetchTMDB = cache(async function fetchTMDB<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    throw new Error('TMDB_API_KEY is not configured.');
  }

  const queryParams = new URLSearchParams({
    ...params,
    api_key: apiKey,
  });

  const url = `${TMDB_BASE_URL}${path}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
    // Next.js ISR revalidation (4 hours)
    next: { revalidate: 14400 },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.status_message || `TMDB API error: ${response.status}`);
  }

  const data = await response.json();

  // Filter out blocked copyright media from results arrays
  if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as any).results)) {
    (data as any).results = (data as any).results.filter((item: any) => {
      if (!item || !item.id) return false;
      const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
      return !isBlockedMedia(item.id, mediaType);
    });
  }

  return data as T;
});

// Fallback image utility
export const TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export const getGenreNames = (genreIds: number[]): string[] => {
  if (!genreIds) return [];
  return genreIds.map((id) => TMDB_GENRES[id]).filter(Boolean);
};

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
  if (!path) return '/placeholder.png'; // Will need a placeholder image or handled by UI
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
