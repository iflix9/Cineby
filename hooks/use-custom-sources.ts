import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomSourcesState {
  sources: Record<string, string>;
  movieTemplate: string;
  tvTemplate: string;
  setSource: (key: string, url: string) => void;
  getSource: (key: string) => string | undefined;
  removeSource: (key: string) => void;
  setMovieTemplate: (url: string) => void;
  setTvTemplate: (url: string) => void;
}

export const useCustomSources = create<CustomSourcesState>()(
  persist(
    (set, get) => ({
      sources: {},
      movieTemplate: '',
      tvTemplate: '',
      setSource: (key, url) => set((state) => ({
        sources: { ...state.sources, [key]: url }
      })),
      getSource: (key) => get().sources[key],
      removeSource: (key) => set((state) => {
        const newSources = { ...state.sources };
        delete newSources[key];
        return { sources: newSources };
      }),
      setMovieTemplate: (url) => set({ movieTemplate: url }),
      setTvTemplate: (url) => set({ tvTemplate: url }),
    }),
    {
      name: 'cineby-custom-sources',
    }
  )
);
