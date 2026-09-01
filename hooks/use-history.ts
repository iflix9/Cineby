import { create } from 'zustand';

export interface HistoryItem {
  id: string; // e.g. "movie-123" or "tv-123"
  mediaId: string;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  season?: number;
  episode?: number;
  episodeName?: string;
  progress?: number; // 0 - 100
  currentTime?: number; // seconds
  duration?: number; // seconds
  updatedAt: number;
}

interface HistoryState {
  items: HistoryItem[];
  addItem: (item: Omit<HistoryItem, 'updatedAt' | 'id'> & { id?: string; updatedAt?: number }) => void;
  updateProgress: (
    mediaId: string,
    type: 'movie' | 'tv',
    data: {
      season?: number;
      episode?: number;
      progress?: number;
      currentTime?: number;
      duration?: number;
      title?: string;
      poster_path?: string | null;
      backdrop_path?: string | null;
      episodeName?: string;
    }
  ) => void;
  removeItem: (id: string) => void;
  clearHistory: () => void;
  getItem: (type: 'movie' | 'tv', mediaId: string) => HistoryItem | undefined;
}

const STORAGE_KEY = 'cinemate-watch-history';

export const useHistory = create<HistoryState>()((set, get) => ({
  items: typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    : [],

  addItem: (item) => set((state) => {
    const itemId = item.id || `${item.type}-${item.mediaId}`;
    const existing = state.items.find((i) => i.id === itemId);

    const newItem: HistoryItem = {
      ...existing,
      ...item,
      id: itemId,
      updatedAt: Date.now(),
    };

    const filtered = state.items.filter((i) => i.id !== itemId);
    const newItems = [newItem, ...filtered];

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    }
    return { items: newItems };
  }),

  updateProgress: (mediaId, type, data) => set((state) => {
    const itemId = `${type}-${mediaId}`;
    const existing = state.items.find((i) => i.id === itemId);

    const newItem: HistoryItem = {
      id: itemId,
      mediaId: String(mediaId),
      type,
      title: data.title || existing?.title || (type === 'movie' ? 'Movie' : 'TV Show'),
      poster_path: data.poster_path ?? existing?.poster_path ?? null,
      backdrop_path: data.backdrop_path ?? existing?.backdrop_path ?? null,
      season: data.season ?? existing?.season,
      episode: data.episode ?? existing?.episode,
      episodeName: data.episodeName ?? existing?.episodeName,
      progress: data.progress ?? existing?.progress,
      currentTime: data.currentTime ?? existing?.currentTime,
      duration: data.duration ?? existing?.duration,
      updatedAt: Date.now(),
    };

    const filtered = state.items.filter((i) => i.id !== itemId);
    const newItems = [newItem, ...filtered];

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    }
    return { items: newItems };
  }),

  removeItem: (id) => set((state) => {
    const newItems = state.items.filter((i) => i.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    }
    return { items: newItems };
  }),

  clearHistory: () => set(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    return { items: [] };
  }),

  getItem: (type, mediaId) => {
    const itemId = `${type}-${mediaId}`;
    return get().items.find((i) => i.id === itemId);
  },
}));
