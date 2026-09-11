'use client';

import { useSyncExternalStore, useRef, useState, MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHistory, HistoryItem } from '@/hooks/use-history';
import { getImageUrl } from '@/lib/tmdb';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

const subscribe = () => () => {};
function useHasMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function ContinueWatchingRow() {
  const router = useRouter();
  const { items } = useHistory();
  const mounted = useHasMounted();
  
  const activeItems = items.filter(item => 
    (item.currentTime && item.currentTime > 0) || 
    (item.progress && item.progress > 0)
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  if (!mounted || activeItems.length === 0) return null;

  const handlePlay = (item: HistoryItem) => {
    if (item.type === 'movie') {
      import('./player-overlay').then(({ playMedia }) => {
        playMedia('movie', item.mediaId);
      });
    } else {
      const s = item.season || 1;
      const e = item.episode || 1;
      import('./player-overlay').then(({ playMedia }) => {
        playMedia('tv', item.mediaId, s, e);
      });
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
        
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  return (
    <section className="relative space-y-4 px-4 sm:px-8 md:px-12 lg:px-16 my-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.play className="w-5 h-5 text-red-500 fill-red-500" />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Continue Watching
          </h2>
        </div>
        <Link
          href="/history"
          className="text-xs sm:text-sm font-semibold text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <span>See All</span>
          <Icons.chevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative group/carousel w-full overflow-hidden rounded-2xl">
        {/* Left Scroll Arrow */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-0 top-0 bottom-0 z-20 bg-gradient-to-r from-black/80 via-black/50 to-transparent hover:from-black/90 text-white opacity-0 group-hover/carousel:opacity-100 transition-all hidden md:flex items-center justify-center w-12 pointer-events-auto group/carousel-left rounded-l-2xl"
        >
          <Icons.chevronLeft className="w-8 h-8 text-zinc-300 group-hover/carousel-left:text-red-500 transition-colors" />
        </button>

        {/* Items Container */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={cn(
            "flex items-center gap-4 overflow-x-auto select-none w-full py-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            isDown ? "cursor-grabbing" : "cursor-grab",
            !isDown && "scroll-smooth"
          )}
        >
          {activeItems.slice(0, 10).map((item) => {
            const imagePath = item.backdrop_path || item.poster_path;
            const progressPct = item.progress && item.progress > 0
              ? item.progress
              : (item.currentTime && item.duration)
                ? Math.min(100, Math.round((item.currentTime / item.duration) * 100))
                : 20;

            return (
              <div
                key={item.id}
                className="group relative flex-none w-60 sm:w-72 bg-zinc-900/80 rounded-2xl border border-zinc-800/80 overflow-hidden hover:border-red-500/50 transition-all duration-300 shadow-lg cursor-pointer"
                onClick={() => handlePlay(item)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
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

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-zinc-200 border border-white/10">
                    {item.type === 'movie' ? 'Movie' : `S${item.season || 1} E${item.episode || 1}`}
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md p-3 sm:p-3.5 rounded-full transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Icons.play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800/80">
                    <div
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, progressPct))}%` }}
                    />
                  </div>
                </div>

                {/* Title & Info */}
                <div className="p-3">
                  <h3 className="font-bold text-sm text-zinc-100 group-hover:text-red-400 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  {item.type === 'tv' && (
                    <p className="text-xs text-zinc-400 font-medium mt-0.5">
                      Season {item.season || 1}, Ep {item.episode || 1}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-0 z-20 bg-gradient-to-l from-black/80 via-black/50 to-transparent hover:from-black/90 text-white opacity-0 group-hover/carousel:opacity-100 transition-all hidden md:flex items-center justify-center w-12 pointer-events-auto group/carousel-right rounded-r-2xl"
        >
          <Icons.chevronRight className="w-8 h-8 text-zinc-300 group-hover/carousel-right:text-red-500 transition-colors" />
        </button>
      </div>
    </section>
  );
}

