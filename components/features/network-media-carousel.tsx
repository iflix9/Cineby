'use client';

import * as React from 'react';
import { MovieCard } from '@/components/ui/movie-card';
import { Media } from '@/types/tmdb';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export interface NetworkOption {
  id: number;          // TMDB network ID for TV Series
  providerId: number;  // TMDB provider ID for Movies
  slug: string;
  name: string;
  tmdbLogo: string;
}

export const NETWORKS: NetworkOption[] = [
  {
    id: 213,
    providerId: 8,
    slug: 'netflix',
    name: 'Netflix',
    tmdbLogo: '/rK1KljqmbvO9HQa1PBFLILWah72.png',
  },
  {
    id: 49,
    providerId: 1899,
    slug: 'hbo',
    name: 'HBO',
    tmdbLogo: '/skypuy7SXuugIQeYg0IglmzoKaS.png',
  },
  {
    id: 3186,
    providerId: 1899,
    slug: 'max',
    name: 'Max',
    tmdbLogo: '/skypuy7SXuugIQeYg0IglmzoKaS.png',
  },
  {
    id: 2739,
    providerId: 337,
    slug: 'disney',
    name: 'Disney+',
    tmdbLogo: '/5eZ872CghnHFLB1j8grszbrx0dx.png',
  },
  {
    id: 1024,
    providerId: 9,
    slug: 'prime',
    name: 'Prime Video',
    tmdbLogo: '/gMZdpavHmxFNnLpMHwVxfqeux2g.png',
  },
  {
    id: 2552,
    providerId: 350,
    slug: 'apple',
    name: 'Apple TV+',
    tmdbLogo: '/9icYBfYFcwgCbky5VdGUIKJ4C5i.png',
  },
  {
    id: 4330,
    providerId: 531,
    slug: 'paramount',
    name: 'Paramount+',
    tmdbLogo: '/4N4BMd0Mm0kHAmF7RZgL5lW3cwc.png',
  },
  {
    id: 453,
    providerId: 15,
    slug: 'hulu',
    name: 'Hulu',
    tmdbLogo: '/44uAnmSqvA4yBOdbPWN8YgQHjWm.png',
  },
  {
    id: 3353,
    providerId: 386,
    slug: 'peacock',
    name: 'Peacock',
    tmdbLogo: '/a1UIdq5BrkcAxnxcUhFsNbXnxeu.png',
  },
];

function NetworkLogoBadge({ network, size = 'md' }: { network: NetworkOption; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'md' 
    ? 'w-6 h-6 sm:w-7 sm:h-7 rounded-lg' 
    : 'w-6 h-6 rounded-md';

  return (
    <div className={cn(
      "relative overflow-hidden shrink-0 shadow-sm border border-white/15 bg-black flex items-center justify-center",
      sizeClasses
    )}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://image.tmdb.org/t/p/w500${network.tmdbLogo}`}
        alt={network.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

interface NetworkMediaCarouselProps {
  initialMovieItems?: Media[];
  initialTvItems?: Media[];
  initialType?: 'movie' | 'tv';
  className?: string;
}

export function NetworkMediaCarousel({
  initialMovieItems = [],
  initialTvItems = [],
  initialType = 'movie',
  className,
}: NetworkMediaCarouselProps) {
  const [selectedNetwork, setSelectedNetwork] = React.useState<NetworkOption>(NETWORKS[0]);
  const [mediaType, setMediaType] = React.useState<'movie' | 'tv'>(initialType);
  
  const startingItems = initialType === 'movie' 
    ? (initialMovieItems.length > 0 ? initialMovieItems : initialTvItems)
    : (initialTvItems.length > 0 ? initialTvItems : initialMovieItems);

  const [items, setItems] = React.useState<Media[]>(startingItems);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Cache fetched networks and types: key `${networkId}-${mediaType}`
  const networkCacheRef = React.useRef<Record<string, Media[]>>({
    [`${NETWORKS[0].id}-movie`]: initialMovieItems,
    [`${NETWORKS[0].id}-tv`]: initialTvItems,
  });

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const [isDown, setIsDown] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftPos, setScrollLeftPos] = React.useState(0);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const hasDraggedRef = React.useRef(false);

  // Close dropdown when clicking outside or pressing Escape
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

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
  }, [checkScrollability, items, isLoading]);

  const fetchMedia = async (network: NetworkOption, type: 'movie' | 'tv') => {
    const cacheKey = `${network.id}-${type}`;
    if (networkCacheRef.current[cacheKey] && networkCacheRef.current[cacheKey].length > 0) {
      setItems(networkCacheRef.current[cacheKey]);
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = type === 'movie'
        ? `/api/tmdb/discover/movie?with_watch_providers=${network.providerId}&watch_region=US&sort_by=popularity.desc`
        : `/api/tmdb/discover/tv?with_networks=${network.id}&sort_by=popularity.desc`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const formatted: Media[] = (data.results || []).map((item: any) => ({
          ...item,
          media_type: type,
        }));
        networkCacheRef.current[cacheKey] = formatted;
        setItems(formatted);
      }
    } catch (err) {
      console.error('Failed to load network media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNetworkChange = async (network: NetworkOption) => {
    if (network.id === selectedNetwork.id) {
      setIsDropdownOpen(false);
      return;
    }

    setSelectedNetwork(network);
    setIsDropdownOpen(false);

    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }

    await fetchMedia(network, mediaType);
  };

  const handleMediaTypeChange = async (type: 'movie' | 'tv') => {
    if (type === mediaType) return;
    setMediaType(type);

    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }

    await fetchMedia(selectedNetwork, type);
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
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 150);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX);
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  return (
    <section className={cn("w-full flex flex-col relative", className)}>
      {/* Header with Network Dropdown (Left) and Movies / Series Tabs (Right) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 relative z-30">
        {/* Left Side: Popular on [Logo] Network Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-1 h-5 md:h-6 bg-red-600 rounded-sm shrink-0" />
          <div className="relative inline-flex items-center">
            <div className="flex items-center flex-wrap gap-2 select-none">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-md">
                Popular on
              </h2>
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 group/trigger focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg py-0.5 px-1 -ml-1 transition-all cursor-pointer"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <NetworkLogoBadge network={selectedNetwork} size="md" />
                <span className="text-xl md:text-2xl font-bold tracking-tight text-white underline underline-offset-4 decoration-white/70 group-hover/trigger:decoration-white transition-colors">
                  {selectedNetwork.name}
                </span>
                <Icons.chevronDown
                  className={cn(
                    "w-5 h-5 text-white/80 group-hover/trigger:text-white transition-transform duration-200",
                    isDropdownOpen && "rotate-180"
                  )}
                />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute left-0 top-full mt-2 w-56 sm:w-64 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                role="listbox"
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                  Select Streaming Network
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar py-1 px-1 pr-1.5 space-y-0.5">
                  {NETWORKS.map((net) => {
                    const isSelected = selectedNetwork.id === net.id;
                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => handleNetworkChange(net)}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 text-sm text-left transition-colors rounded-lg cursor-pointer",
                          isSelected
                            ? "text-white font-semibold bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                            : "text-zinc-300 hover:text-white hover:bg-white/5"
                        )}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex items-center gap-2.5">
                          <NetworkLogoBadge network={net} size="sm" />
                          <span className="truncate">{net.name}</span>
                        </div>
                        {isSelected && (
                          <Icons.check className="w-4 h-4 text-red-500 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Movies / Series Tabs (matching example image) */}
        <div className="flex items-center self-start sm:self-center border-b border-zinc-800/80">
          <button
            type="button"
            onClick={() => handleMediaTypeChange('movie')}
            className={cn(
              "relative pb-2 px-3 text-sm sm:text-base font-semibold transition-colors cursor-pointer select-none",
              mediaType === 'movie'
                ? "text-red-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-red-500 after:rounded-full"
                : "text-zinc-400 hover:text-white"
            )}
          >
            Movies
          </button>
          <button
            type="button"
            onClick={() => handleMediaTypeChange('tv')}
            className={cn(
              "relative pb-2 px-3 text-sm sm:text-base font-semibold transition-colors cursor-pointer select-none",
              mediaType === 'tv'
                ? "text-red-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-red-500 after:rounded-full"
                : "text-zinc-400 hover:text-white"
            )}
          >
            Series
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative group/carousel w-full overflow-hidden">
        {/* Left Arrow Button */}
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
          {isLoading ? (
            // Skeleton Loader Cards
            Array.from({ length: 8 }).map((_, idx) => (
              <div 
                key={idx} 
                className="w-[148px] min-[390px]:w-[162px] min-[500px]:w-[170px] sm:w-[180px] md:w-[188px] lg:w-[198px] xl:w-[206px] shrink-0 snap-start animate-pulse"
              >
                <div className="aspect-[2/3] w-full bg-neutral-800/80 rounded-xl" />
                <div className="h-4 bg-neutral-800/80 rounded mt-2.5 w-3/4" />
                <div className="h-3 bg-neutral-800/50 rounded mt-1.5 w-1/2" />
              </div>
            ))
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="w-[148px] min-[390px]:w-[162px] min-[500px]:w-[170px] sm:w-[180px] md:w-[188px] lg:w-[198px] xl:w-[206px] shrink-0 snap-start relative whitespace-normal"
              >
                <MovieCard media={item} />
              </div>
            ))
          )}
        </div>

        {/* Right Arrow Button */}
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
