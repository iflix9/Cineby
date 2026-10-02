'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Film } from 'lucide-react';
import { Video } from '@/types/tmdb';
import { playTrailer } from './player-overlay';

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter to valid YouTube videos
  const validVideos = (videos || []).filter(
    (v) => v.site === 'YouTube' && v.key && (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip' || v.type === 'Featurette')
  );

  if (validVideos.length === 0) return null;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Film className="w-5 h-5 text-red-500" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Trailers & Clips
          </h2>
          <span className="text-xs font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full">
            {validVideos.length}
          </span>
        </div>

        {validVideos.length > 2 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              aria-label="Previous trailers"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              aria-label="Next trailers"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-3 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {validVideos.map((video) => {
          const thumbnailUrl = `https://img.youtube.com/vi/${video.key}/mqdefault.jpg`;
          return (
            <button
              key={video.id || video.key}
              type="button"
              onClick={() => {
                playTrailer(video.key, `${mediaTitle} - ${video.name}`, mediaInfo ? {
                  type: mediaInfo.type,
                  mediaId: mediaInfo.mediaId,
                } : undefined);
              }}
              className="group relative flex-none w-[260px] sm:w-[320px] md:w-[360px] text-left cursor-pointer snap-start focus:outline-none"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/10 group-hover:ring-red-500/50 transition-all duration-300 shadow-lg">
                <Image
                  src={thumbnailUrl}
                  alt={video.name}
                  fill
                  sizes="(max-width: 640px) 260px, (max-width: 768px) 320px, 360px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Dark Vignette & Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition-colors" />

                {/* Center Play Icon Pill */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                    <Play className="w-5 h-5 fill-white translate-x-0.5" />
                  </div>
                </div>

                {/* Badge Tag */}
                <div className="absolute top-2.5 left-2.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md ${
                    video.type === 'Trailer'
                      ? 'bg-red-600/80 text-white border-red-500/40'
                      : 'bg-zinc-900/80 text-zinc-300 border-white/10'
                  }`}>
                    {video.type}
                  </span>
                </div>
              </div>

              {/* Video Title */}
              <div className="mt-2.5 space-y-0.5">
                <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white line-clamp-1 transition-colors">
                  {video.name}
                </h3>
                <p className="text-xs text-zinc-500">
                  {video.type} &bull; YouTube
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
