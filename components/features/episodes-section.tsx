'use client';

import * as React from 'react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/ui/icons';
import { getImageUrl } from '@/lib/tmdb';
import { ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { playMedia } from './player-overlay';
import { triggerAdPopUp } from '@/lib/ad';
import { cn } from '@/lib/utils';

interface EpisodesSectionProps {
  show: any;
  allSeasonsData: any[];
  seasonNum: string;
  episodeNum: string;
}

export function EpisodesSection({ show, allSeasonsData, seasonNum, episodeNum }: EpisodesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const [activeSeason, setActiveSeason] = useState(Number(seasonNum) || 1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Carousel scroll & drag state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const hasDraggedRef = useRef(false);

  const activeSeasonData = useMemo(() => {
    return allSeasonsData?.find((s) => s && s.season_number === activeSeason);
  }, [allSeasonsData, activeSeason]);

  const filteredAndSortedEpisodes = useMemo(() => {
    if (!activeSeasonData?.episodes) return [];
    
    let result = [...activeSeasonData.episodes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((ep: any) => 
        ep.name.toLowerCase().includes(q) || 
        ep.overview?.toLowerCase().includes(q)
      );
    }

    if (sortDesc) {
      result.reverse();
    }

    return result;
  }, [activeSeasonData, searchQuery, sortDesc]);

  // Make sure we only show valid seasons
  const validSeasons = show.seasons?.filter((s: any) => s.season_number > 0) || [];

  const checkScrollability = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
    }
  }, []);

  useEffect(() => {
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
  }, [checkScrollability, filteredAndSortedEpisodes]);

  // Reset scroll to beginning when season changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeSeason]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Scroll by ~2.5 cards or 75% of view
      const scrollOffset = clientWidth * 0.75;
      const target = direction === 'left' ? scrollLeft - scrollOffset : scrollLeft + scrollOffset;
      scrollRef.current.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  // Mouse drag-to-scroll handlers
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
    }, 120);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      return;
    }
    const target = e.currentTarget;
    if (target.dataset.released !== 'true') return;
    const sNum = target.dataset.season;
    const epNum = target.dataset.episode;
    if (sNum && epNum) {
      triggerAdPopUp();
      playMedia('tv', show.id.toString(), Number(sNum), Number(epNum));
    }
  };

  return (
    <section id="episodes" className="relative group/episodes scroll-mt-24 space-y-5 w-full">
      {/* Header with Title, Season Selector & Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        {/* Left: Heading + Season Selector */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 md:h-6 bg-red-600 rounded-sm" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-md">
              Episodes
            </h2>
          </div>

          {/* Netflix Style Season Dropdown */}
          <div className="relative z-30">
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-white text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:py-2 rounded-lg flex items-center gap-2 transition-all duration-150 active:scale-95 shadow-sm"
              aria-label="Select season"
              aria-expanded={isDropdownOpen}
            >
              <span>Season {activeSeason}</span>
              <Icons.chevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
            </button>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-2 min-w-[170px] bg-zinc-900/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.8)] overflow-hidden origin-top z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar">
                    {validSeasons.map((s: any) => {
                      const isSelected = activeSeason === s.season_number;
                      return (
                        <button
                          key={s.id} 
                          onClick={() => {
                            setActiveSeason(s.season_number);
                            setIsDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-between",
                            isSelected 
                              ? "bg-red-600/20 text-red-400 font-semibold" 
                              : "text-zinc-300 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <span>Season {s.season_number}</span>
                          {s.episode_count && (
                            <span className="text-[11px] text-zinc-500 font-normal">
                              {s.episode_count} eps
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <span className="text-xs text-zinc-400 font-medium hidden min-[480px]:inline-block">
            {filteredAndSortedEpisodes.length} {filteredAndSortedEpisodes.length === 1 ? 'Episode' : 'Episodes'}
          </span>
        </div>

        {/* Right: Search, Sort, and Horizontal Arrow Nav */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Search */}
          <div className="relative flex items-center bg-zinc-900/80 border border-white/10 px-3 py-1.5 rounded-lg flex-1 sm:w-48 lg:w-56 focus-within:border-red-500/60 focus-within:bg-zinc-900 transition-all">
            <Icons.search className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Filter episode..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white w-full placeholder:text-zinc-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-zinc-400 hover:text-white p-0.5 ml-1"
                title="Clear filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort Button */}
          <button 
            onClick={() => setSortDesc(!sortDesc)}
            className="bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white p-2 rounded-lg transition-colors active:scale-95"
            title={sortDesc ? "Sort Oldest to Newest" : "Sort Newest to Oldest"}
            aria-label="Sort episodes"
          >
            {sortDesc ? <ArrowUpAZ className="w-4 h-4" /> : <ArrowDownAZ className="w-4 h-4" />}
          </button>

          {/* Left / Right Chevron Buttons */}
          <div className="flex items-center gap-1 pl-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll episodes left"
              className={cn(
                "p-2 rounded-lg border transition-all duration-150 active:scale-95",
                canScrollLeft
                  ? "bg-zinc-900/90 hover:bg-zinc-800 text-white border-white/10 hover:border-white/20 cursor-pointer"
                  : "bg-zinc-950/40 text-zinc-600 border-white/5 cursor-not-allowed opacity-50"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll episodes right"
              className={cn(
                "p-2 rounded-lg border transition-all duration-150 active:scale-95",
                canScrollRight
                  ? "bg-zinc-900/90 hover:bg-zinc-800 text-white border-white/10 hover:border-white/20 cursor-pointer"
                  : "bg-zinc-950/40 text-zinc-600 border-white/5 cursor-not-allowed opacity-50"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Netflix Horizontal Row Carousel Container */}
      <div className="relative group/carousel w-full">
        {/* Left Side Floating Backdrop Arrow (Desktop) - matching media carousel style */}
        <button 
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll episodes left"
          className={cn(
            "absolute left-0 top-0 bottom-5 z-20 bg-black/60 hover:bg-black/90 text-white transition-all duration-200 hidden md:flex items-center justify-center w-12 pointer-events-auto group/carousel-left rounded-l-xl",
            canScrollLeft 
              ? "opacity-0 group-hover/carousel:opacity-100 cursor-pointer" 
              : "opacity-0 pointer-events-none cursor-default"
          )}
        >
          <Icons.chevronLeft className="w-8 h-8 text-zinc-300 group-hover/carousel-left:text-red-500 transition-colors" />
        </button>

        {/* Scrollable Row */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={cn(
            "flex gap-4 sm:gap-5 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-5 pt-1 px-1 scrollbar-hide select-none w-full",
            isDown ? "cursor-grabbing" : "cursor-grab",
            !isDown && "scroll-smooth"
          )} 
        >
          {filteredAndSortedEpisodes.length === 0 ? (
            <div className="w-full py-14 text-center text-zinc-400 bg-zinc-900/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2">
              <p className="text-sm font-medium">No episodes found matching &quot;{searchQuery}&quot;</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-red-500 hover:text-red-400 font-semibold underline underline-offset-4"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredAndSortedEpisodes.map((ep: any) => {
              const todayStr = new Date().toISOString().split('T')[0];
              const isReleased = ep.air_date ? ep.air_date <= todayStr : false;

              return (
                <div
                  key={ep.id}
                  data-season={ep.season_number}
                  data-episode={ep.episode_number}
                  data-released={isReleased ? "true" : "false"}
                  role={isReleased ? "button" : "group"}
                  tabIndex={isReleased ? 0 : undefined}
                  onClick={handleCardClick}
                  onKeyDown={(e) => {
                    if (isReleased && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      triggerAdPopUp();
                      playMedia('tv', show.id.toString(), ep.season_number, ep.episode_number);
                    }
                  }}
                  className={cn(
                    "group/card flex flex-col w-[260px] sm:w-[300px] md:w-[330px] lg:w-[350px] shrink-0 snap-start text-left transition-all duration-200 outline-none",
                    isReleased ? "cursor-pointer" : "cursor-default opacity-60"
                  )}
                >
                  {/* Thumbnail Container (16:9 Video Aspect) */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-900 transition-all duration-300 ring-1 ring-white/10 group-hover/card:ring-white/30 group-hover/card:shadow-[0_10px_24px_rgba(0,0,0,0.6)] group-hover/card:scale-[1.02]">
                    {ep.still_path || show.backdrop_path ? (
                      <Image 
                        src={getImageUrl(ep.still_path || show.backdrop_path, 'w500')}
                        alt={ep.name}
                        fill
                        className={cn(
                          "object-cover transition-transform duration-500",
                          isReleased && "group-hover/card:scale-105"
                        )}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-900 text-xs font-medium">
                        No Preview Available
                      </div>
                    )}

                    {/* Gradient Overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Episode Number Badge (Top-Left) */}
                    <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-white border border-white/10 shadow-sm flex items-center gap-1 z-10">
                      <span>EP {ep.episode_number}</span>
                    </div>

                    {/* Runtime Pill (Bottom-Right) */}
                    {ep.runtime > 0 && isReleased && (
                      <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-medium text-zinc-300 border border-white/10 z-10">
                        {ep.runtime}m
                      </div>
                    )}

                    {/* Hover Play Button (Exact style from Movie Card) */}
                    {isReleased ? (
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 flex items-center justify-center z-10">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full transform translate-y-4 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300">
                          <Icons.play className="w-6 h-6 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-zinc-950/85 flex flex-col items-center justify-center text-center p-3 z-10 backdrop-blur-[2px]">
                        <span className="text-white font-bold text-[11px] uppercase tracking-wider mb-1">Coming Soon</span>
                        {ep.air_date && (
                          <span className="text-red-500 font-semibold text-xs">
                            {new Date(ep.air_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metadata Below Thumbnail */}
                  <div className="pt-2.5 px-0.5 flex flex-col">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className={cn(
                        "font-semibold text-sm sm:text-[15px] leading-snug line-clamp-1 transition-colors duration-200",
                        isReleased 
                          ? "text-zinc-100 group-hover/card:text-red-400" 
                          : "text-zinc-500"
                      )}>
                        {ep.episode_number}. {ep.name}
                      </h4>
                    </div>

                    {ep.air_date && isReleased && (
                      <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
                        {new Date(ep.air_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mt-1 font-normal">
                      {ep.overview || 'No synopsis available for this episode.'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side Floating Backdrop Arrow (Desktop) - matching media carousel style */}
        <button 
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll episodes right"
          className={cn(
            "absolute right-0 top-0 bottom-5 z-20 bg-black/60 hover:bg-black/90 text-white transition-all duration-200 hidden md:flex items-center justify-center w-12 pointer-events-auto group/carousel-right rounded-r-xl",
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
