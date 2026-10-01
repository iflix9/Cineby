'use client';

import * as React from 'react';
import Image from 'next/image';
import { Cast } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface CastCarouselProps {
  cast: Cast[];
  title?: string;
  className?: string;
}

export function CastCarousel({ cast, title = 'Top Cast', className }: CastCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftPos, setScrollLeftPos] = React.useState(0);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  
  // Track whether mouse moved significantly to prevent link click on drag
  const hasDraggedRef = React.useRef(false);

  const checkScrollability = React.useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  }, []);

  React.useEffect(() => {
    checkScrollability();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScrollability, { passive: true });
    }
    window.addEventListener('resize', checkScrollability);

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScrollability);
      }
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability, cast]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
        
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    hasDraggedRef.current = false;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
    // Keep hasDraggedRef true for a short moment so click event can check it
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 150);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX); // scroll distance
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
    }
  };

  if (!cast || cast.length === 0) return null;

  return (
    <section className={cn("w-full flex flex-col", className)}>
      <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-5 mb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-1 h-5 md:h-6 bg-red-600 rounded-sm"></div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-md">
            {title}
          </h2>
        </div>
      </div>

      <div className="relative group/carousel w-full overflow-hidden">
        {/* Left Arrow Button - only icon */}
        <button 
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className={cn(
            "absolute left-0 top-0 bottom-0 z-20 bg-black/60 hover:bg-black/90 text-white transition-all duration-200 hidden md:flex items-center justify-center w-12 pointer-events-auto group/carousel-left rounded-l-xl",
            canScrollLeft 
              ? "opacity-0 group-hover/carousel:opacity-100 cursor-pointer" 
              : "opacity-0 pointer-events-none cursor-default"
          )}
        >
          <Icons.chevronLeft className="w-8 h-8 text-zinc-300 group-hover/carousel-left:text-red-500 transition-colors" />
        </button>

        {/* Cast Items Row Container */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={cn(
            "flex gap-3 min-[390px]:gap-3.5 sm:gap-4 md:gap-[18px] lg:gap-5 overflow-x-auto snap-x snap-mandatory pb-6 sm:pb-8 pt-2 px-0.5 scrollbar-hide select-none w-full transition-cursor",
            isDown ? "cursor-grabbing" : "cursor-grab",
            !isDown && "scroll-smooth"
          )} 
        >
          {cast.map((actor) => (
            <div 
              key={actor.id} 
              className="w-[125px] min-[390px]:w-[136px] sm:w-[148px] md:w-[158px] lg:w-[165px] shrink-0 snap-start relative whitespace-normal group flex flex-col"
            >
              <div 
                className="flex flex-col rounded-xl select-none"
              >
                {/* Photo container */}
                <div className="aspect-[2/3] relative w-full rounded-xl overflow-hidden bg-neutral-900 border border-zinc-800/70 group-hover:border-zinc-700 shadow-md group-hover:shadow-lg transition-all duration-300">
                  {actor.profile_path ? (
                    <Image 
                      src={getImageUrl(actor.profile_path, 'w500')}
                      alt={actor.name}
                      fill
                      sizes="(max-width: 640px) 140px, (max-width: 1024px) 160px, 180px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 bg-gradient-to-b from-neutral-800 to-neutral-900 p-2 text-center">
                      <div className="w-10 h-10 rounded-full bg-neutral-700/60 flex items-center justify-center mb-1.5 text-zinc-400">
                        <Icons.user className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-medium text-zinc-400 line-clamp-1">No Image</span>
                    </div>
                  )}

                  {/* Gradient shadow overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Actor Info */}
                <div className="mt-2.5 space-y-0.5 px-0.5 text-left">
                  <div className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate group-hover:text-zinc-200 transition-colors duration-200">
                    {actor.name}
                  </div>
                  {actor.character && (
                    <div className="text-[11px] sm:text-xs font-normal text-zinc-400 truncate">
                      {actor.character}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow Button - only icon */}
        <button 
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className={cn(
            "absolute right-0 top-0 bottom-0 z-20 bg-black/60 hover:bg-black/90 text-white transition-all duration-200 hidden md:flex items-center justify-center w-12 pointer-events-auto group/carousel-right rounded-r-xl",
            canScrollRight 
              ? "opacity-0 group-hover/carousel:opacity-100 cursor-pointer" 
              : "opacity-0 pointer-events-none cursor-default"
          )}
        >
          <Icons.chevronRight className="w-8 h-8 text-zinc-300 group-hover/carousel-right:text-red-500 transition-colors" />
        </button>
      </div>
    </section>
  );
}
