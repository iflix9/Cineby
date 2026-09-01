'use client';

import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHistory, HistoryItem } from '@/hooks/use-history';
import { getImageUrl } from '@/lib/tmdb';
import { Icons } from '@/components/ui/icons';

const subscribe = () => () => {};
function useHasMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

function formatTimeAgo(timestamp: number): string {
  if (!timestamp) return '';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatRemainingTime(item: HistoryItem): string | null {
  if (item.currentTime && item.duration && item.duration > 0) {
    const remaining = Math.max(0, item.duration - item.currentTime);
    const mins = Math.ceil(remaining / 60);
    if (mins < 1) return 'Near completion';
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m left`;
    }
    return `${mins}m left`;
  }
  if (item.progress && item.progress > 0) {
    return `${Math.round(item.progress)}% watched`;
  }
  return null;
}

export function HistoryClient() {
  const router = useRouter();
  const { items, removeItem, clearHistory } = useHistory();
  const mounted = useHasMounted();
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const activeEditMode = isEditMode && items.length > 0;

  if (!mounted) {
    return <div className="pt-32 px-4 text-center min-h-screen text-zinc-400">Loading your history...</div>;
  }

  const filteredItems = items.filter((item) => {
    if (filter === 'movie') return item.type === 'movie';
    if (filter === 'tv') return item.type === 'tv';
    return true;
  });

  const handlePlay = (item: HistoryItem) => {
    if (item.type === 'movie') {
      import('@/components/features/player-overlay').then(({ playMedia }) => {
        playMedia('movie', item.mediaId);
      });
    } else {
      const s = item.season || 1;
      const e = item.episode || 1;
      import('@/components/features/player-overlay').then(({ playMedia }) => {
        playMedia('tv', item.mediaId, s, e);
      });
    }
  };

  return (
    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full min-h-screen text-white pb-32">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 shrink-0">
            <Icons.library className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Watch History</h1>
            {items.length > 0 && (
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                {items.length} {items.length === 1 ? 'item' : 'items'} in history
              </p>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
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

            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-900/80 hover:bg-red-950/40 border border-zinc-800/80 hover:border-red-500/40 text-zinc-300 hover:text-red-400 transition-all touch-manipulation min-h-[42px]"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-white">Clear Watch History?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Are you sure you want to remove all items from your watch history? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors touch-manipulation"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
          {(['all', 'movie', 'tv'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold capitalize transition-all shrink-0 touch-manipulation min-h-[38px] ${
                filter === t
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/60'
              }`}
            >
              {t === 'all' ? 'All History' : t === 'movie' ? 'Movies' : 'TV Shows'}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30 p-8 sm:p-12">
          <div className="bg-neutral-900 p-4 rounded-full mb-4">
            <Icons.library className="w-8 h-8 text-neutral-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {items.length === 0 ? 'Your watch history is empty' : 'No items found'}
          </h2>
          <p className="text-neutral-500 max-w-sm mb-6 text-sm">
            {items.length === 0
              ? 'Movies and TV shows you watch will appear here so you can easily resume watching.'
              : `You don't have any ${filter === 'movie' ? 'movies' : 'TV shows'} in your history.`}
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-sm transition-all shadow-lg shadow-red-600/25 flex items-center gap-2 touch-manipulation"
          >
            <Icons.play className="w-4 h-4 fill-white" />
            <span>Explore Content</span>
          </Link>
        </div>
      ) : (
        /* Grid of History Items */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const imagePath = item.backdrop_path || item.poster_path;
            const remaining = formatRemainingTime(item);
            const progressPct = item.progress && item.progress > 0
              ? item.progress
              : (item.currentTime && item.duration)
                ? Math.min(100, Math.round((item.currentTime / item.duration) * 100))
                : 15;

            return (
              <div
                key={item.id}
                className="group relative bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden hover:border-red-500/50 transition-all duration-300 flex flex-col shadow-lg"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden cursor-pointer" onClick={() => handlePlay(item)}>
                  {imagePath ? (
                    <Image
                      src={getImageUrl(imagePath, 'w500')}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                      <Icons.clapperboard className="w-8 h-8" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Type Tag */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-zinc-200 border border-white/10">
                    {item.type === 'movie' ? 'Movie' : `S${item.season || 1} E${item.episode || 1}`}
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md p-3.5 sm:p-4 rounded-full transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Icons.play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800/80">
                    <div
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(4, progressPct))}%` }}
                    />
                  </div>
                </div>

                {/* Remove button */}
                {(activeEditMode || true) && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    title="Remove from History"
                    className={`absolute top-2 right-2 z-20 w-9 h-9 rounded-full bg-zinc-900/95 hover:bg-zinc-800 backdrop-blur-md text-zinc-300 hover:text-red-500 flex items-center justify-center shadow-lg border border-zinc-700/80 hover:border-red-500/60 transition-all duration-200 group/remove touch-manipulation ${
                      activeEditMode
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 md:group-hover:opacity-100 md:group-hover:scale-100'
                    }`}
                  >
                    <Icons.x className="w-4 h-4 stroke-[2.5] text-zinc-300 group-hover/remove:text-red-500 transition-colors" />
                  </button>
                )}

                {/* Details Container */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => handlePlay(item)}
                      className="font-bold text-base text-zinc-100 group-hover:text-red-400 transition-colors line-clamp-1 cursor-pointer mb-1"
                    >
                      {item.title}
                    </h3>

                    {item.type === 'tv' && (
                      <p className="text-xs text-zinc-400 font-medium mb-1">
                        Season {item.season || 1}, Episode {item.episode || 1}
                        {item.episodeName ? ` — ${item.episodeName}` : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/50">
                    <span className="flex items-center gap-1 font-medium">
                      <Icons.clock className="w-3.5 h-3.5 text-zinc-500" />
                      {formatTimeAgo(item.updatedAt)}
                    </span>

                    {remaining && (
                      <span className="text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        {remaining}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

