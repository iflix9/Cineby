'use client';

import { useSyncExternalStore, useState } from 'react';
import { useWatchlist } from '@/hooks/use-watchlist';
import { MovieCard } from '@/components/ui/movie-card';
import { Icons } from '@/components/ui/icons';

const subscribe = () => () => {};
function useHasMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export default function WatchlistClient() {
  const { items, removeItem } = useWatchlist();
  const mounted = useHasMounted();
  const [isEditMode, setIsEditMode] = useState(false);

  const activeEditMode = isEditMode && items.length > 0;

  if (!mounted) {
    return <div className="pt-32 px-4 text-center min-h-screen text-zinc-400">Loading your watchlist...</div>;
  }

  return (
    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full min-h-screen text-white pb-32">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 shrink-0">
            <Icons.heart className="w-6 h-6 sm:w-7 sm:h-7 fill-red-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Watchlist</h1>
            {items.length > 0 && (
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved
              </p>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => setIsEditMode(!activeEditMode)}
            className={`flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all touch-manipulation min-h-[42px] ${
              activeEditMode
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 hover:border-red-500/50'
            }`}
          >
            {activeEditMode ? (
              <>
                <Icons.check className="w-4 h-4" />
                <span>Done</span>
              </>
            ) : (
              <>
                <Icons.x className="w-4 h-4 text-red-500" />
                <span>Remove Items</span>
              </>
            )}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30 p-8 sm:p-12">
          <div className="bg-neutral-900 p-4 rounded-full mb-4">
            <Icons.heartCrack className="w-8 h-8 text-neutral-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
          <p className="text-neutral-500 max-w-sm mb-6 text-sm">
            Save shows and movies to keep track of what you want to watch.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 md:gap-6">
          {items.map((media) => (
            <div key={media.id} className="relative group">
              <MovieCard media={media} />

              {/* Remove button */}
              {(activeEditMode || true) && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeItem(media.id);
                  }}
                  title="Remove from Watchlist"
                  className={`absolute top-2 right-2 z-20 w-9 h-9 rounded-full bg-zinc-900/95 hover:bg-zinc-800 backdrop-blur-md text-zinc-300 hover:text-red-500 flex items-center justify-center shadow-lg border border-zinc-700/80 hover:border-red-500/60 transition-all duration-200 group/remove touch-manipulation ${
                    activeEditMode
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 md:group-hover:opacity-100 md:group-hover:scale-100'
                  }`}
                >
                  <Icons.x className="w-4 h-4 stroke-[2.5] text-zinc-300 group-hover/remove:text-red-500 transition-colors" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


