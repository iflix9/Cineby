import { create } from 'zustand';
import { Media } from '@/types/tmdb';

interface WatchlistState {
  items: Media[];
  addItem: (item: Media) => void;
  removeItem: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
}

export const useWatchlist = create<WatchlistState>()((set, get) => ({
  items: typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('cinemate-watchlist') || '[]')
    : [],
  addItem: (item) => set((state) => {
    const newItems = [...state.items, item];
    localStorage.setItem('cinemate-watchlist', JSON.stringify(newItems));
    return { items: newItems };
  }),
  removeItem: (id) => set((state) => {
    const newItems = state.items.filter((i) => i.id !== id);
    localStorage.setItem('cinemate-watchlist', JSON.stringify(newItems));
    return { items: newItems };
  }),
  isInWatchlist: (id) => get().items.some((i) => i.id === id),
}));
