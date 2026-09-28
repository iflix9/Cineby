import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomSourcesState {
  sources: Record<string, string>;
  movieTemplate: string;
  tvTemplate: string;
  streamingMode: boolean;
  setSource: (key: string, url: string) => void;
  getSource: (key: string) => string | undefined;
  removeSource: (key: string) => void;
  setMovieTemplate: (url: string) => void;
  setTvTemplate: (url: string) => void;
  setStreamingMode: (enabled: boolean) => void;
}

export const useCustomSources = create<CustomSourcesState>()(
  persist(
    (set, get) => ({
      sources: {},
      movieTemplate: '',
      tvTemplate: '',
      streamingMode: false,
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
      setStreamingMode: (enabled) => set({ streamingMode: enabled }),
    }),
    {
      name: 'cineby-custom-sources',
    }
  )
);
