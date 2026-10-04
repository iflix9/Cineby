'use client';

import * as React from 'react';
import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/ui/icons';
import { Video } from '@/types/tmdb';
import { playTrailer } from './player-overlay';
import { cn } from '@/lib/utils';

interface TrailersCarouselProps {
  videos: Video[];
  mediaTitle: string;
  mediaInfo?: {
    type: 'movie' | 'tv';
    mediaId: string;
  };
}

export function TrailersCarousel({ videos, mediaTitle, mediaInfo }: TrailersCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const hasDraggedRef = useRef(false);

  // Filter to valid YouTube videos
  const validVideos = (videos || []).filter(
    (v) => v.site === 'YouTube' && v.key && (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip' || v.type === 'Featurette')
  );

  const checkScrollability = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
    }
  }, []);

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollability, validVideos]);

  if (validVideos.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollability, 350);
    }
  };

  // Mouse drag-to-scroll implementation matching episodes-section
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
    }, 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
    checkScrollability();
  };

  return (
    <section className="relative w-full space-y-3">
      {/* Section Header matching other carousels */}
      <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-5 mb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-1 h-5 md:h-6 bg-red-600 rounded-sm" />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-md">
            Trailers & Clips
          </h2>
          <span className="text-xs font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full">
            {validVideos.length}
          </span>
        </div>
      </div>

      {/* Carousel Container with Overlay Left/Right Arrows */}
      <div className="relative group/carousel w-full">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          aria-label="Previous trailers"
          className={cn(
            "absolute left-0 top-0 bottom-5 z-20 bg-black/60 hover:bg-black/90 text-white transition-all duration-200 hidden md:flex items-center justify-center w-12 pointer-events-auto group/carousel-left rounded-l-xl",
            canScrollLeft 
              ? "opacity-0 group-hover/carousel:opacity-100 cursor-pointer" 
              : "opacity-0 pointer-events-none cursor-default"
          )}
        >
          <Icons.chevronLeft className="w-8 h-8 text-zinc-300 group-hover/carousel-left:text-red-500 transition-colors" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          aria-label="Next trailers"
          className={cn(
            "absolute right-0 top-0 bottom-5 z-20 bg-black/60 hover:bg-black/90 text-white transition-all duration-200 hidden md:flex items-center justify-center w-12 pointer-events-auto group/carousel-right rounded-r-xl",
            canScrollRight 
              ? "opacity-0 group-hover/carousel:opacity-100 cursor-pointer" 
              : "opacity-0 pointer-events-none cursor-default"
          )}
        >
          <Icons.chevronRight className="w-8 h-8 text-zinc-300 group-hover/carousel-right:text-red-500 transition-colors" />
        </button>

        {/* Scrollable Row with scrollbar completely removed */}
        <div
          ref={scrollRef}
          onScroll={checkScrollability}
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
          {validVideos.map((video) => {
            const thumbnailUrl = `https://img.youtube.com/vi/${video.key}/mqdefault.jpg`;
            return (
              <div
                key={video.id || video.key}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (hasDraggedRef.current) return;
                  playTrailer(video.key, `${mediaTitle} - ${video.name}`, mediaInfo ? {
                    type: mediaInfo.type,
                    mediaId: mediaInfo.mediaId,
                  } : undefined);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    playTrailer(video.key, `${mediaTitle} - ${video.name}`, mediaInfo ? {
                      type: mediaInfo.type,
                      mediaId: mediaInfo.mediaId,
                    } : undefined);
                  }
                }}
                className="group/card flex flex-col w-[260px] sm:w-[300px] md:w-[330px] lg:w-[350px] shrink-0 snap-start text-left transition-all duration-200 outline-none cursor-pointer"
              >
                {/* Thumbnail Container (16:9 Aspect identical to Episode Card) */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-900 transition-all duration-300 ring-1 ring-white/10 group-hover/card:ring-white/30 group-hover/card:shadow-[0_10px_24px_rgba(0,0,0,0.6)] group-hover/card:scale-[1.02]">
                  <Image
                    src={thumbnailUrl}
                    alt={video.name}
                    fill
                    sizes="(max-width: 640px) 260px, (max-width: 768px) 300px, 350px"
                    className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                    referrerPolicy="no-referrer"
                  />

                  {/* Gradient Overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Category Badge (Top-Left identical to EP Badge) */}
                  <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-white border border-white/10 shadow-sm flex items-center gap-1 z-10">
                    <span className={video.type === 'Trailer' ? 'text-red-400 font-extrabold' : 'text-zinc-200'}>
                      {video.type}
                    </span>
                  </div>

                  {/* Hover Play Button (Exact style from Episode Card / Movie Card) */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 flex items-center justify-center z-10">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full transform translate-y-4 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300">
                      <Icons.play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Video Metadata Below Thumbnail */}
                <div className="pt-2.5 px-0.5 flex flex-col">
                  <h4 className="font-semibold text-sm line-clamp-1 text-zinc-100 group-hover/card:text-red-500 transition-colors">
                    {video.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                    <span className="font-medium text-zinc-400">Official {video.type}</span>
                    <span>&bull;</span>
                    <span className="text-zinc-500">YouTube</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
