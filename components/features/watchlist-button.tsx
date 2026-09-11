'use client';

import { useWatchlist } from '@/hooks/use-watchlist';
import { Media } from '@/types/tmdb';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function WatchlistButton({ media, className, iconOnly }: { media: Media, className?: string, iconOnly?: boolean }) {
  const { addItem, removeItem, isInWatchlist } = useWatchlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return (
     <button className={cn(
       iconOnly 
        ? "w-[46px] h-[46px] rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-white opacity-50"
        : "flex flex-col items-center gap-1 opacity-50", 
       className
     )}>
       <Icons.plus className={iconOnly ? "w-6 h-6" : "w-6 h-6"} />
       {!iconOnly && <span className="text-xs">Save</span>}
     </button>
  );

  const inList = isInWatchlist(media.id);

  const toggleList = () => {
    if (inList) {
      removeItem(media.id);
    } else {
      addItem(media);
    }
  };

  if (iconOnly) {
    return (
      <button 
        onClick={toggleList}
        title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
        className={cn(
          "w-[46px] h-[46px] rounded-full bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_6px_rgba(0,0,0,0.4)] hover:ring-red-500/50 hover:from-zinc-800 hover:to-zinc-900 flex items-center justify-center text-zinc-300 hover:text-red-500 transition-all duration-200 active:scale-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] group/wl",
          inList && "bg-gradient-to-b from-white to-zinc-200 ring-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_2px_6px_rgba(0,0,0,0.3)] text-black hover:from-white hover:to-zinc-100 hover:text-black",
          className
        )}
      >
        {inList ? <Icons.check className="w-5 h-5" /> : <Icons.plus className="w-6 h-6 text-zinc-300 group-hover/wl:text-red-500 transition-colors" />}
      </button>
    );
  }

  return (
    <button 
      onClick={toggleList}
      className={cn(
        "flex flex-col items-center gap-2 group/wl transition-all duration-200 active:scale-95 active:opacity-80",
        className
      )}
    >
      <div className={cn(
        "p-3 rounded-full transition-all duration-200",
        inList 
          ? "bg-gradient-to-b from-white to-zinc-200 ring-1 ring-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_2px_6px_rgba(0,0,0,0.3)] text-black" 
          : "bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_6px_rgba(0,0,0,0.4)] text-zinc-300 group-hover/wl:ring-red-500/50 group-hover/wl:from-zinc-800 group-hover/wl:to-zinc-900 group-hover/wl:text-red-500"
      )}>
        {inList ? <Icons.check className="w-5 h-5" /> : <Icons.plus className="w-6 h-6 text-zinc-300 group-hover/wl:text-red-500 transition-colors" />}
      </div>
      <span className="text-sm font-medium text-neutral-300 group-hover/wl:text-red-500 transition-colors">
        {inList ? 'Saved' : 'Watchlist'}
      </span>
    </button>
  );
}
