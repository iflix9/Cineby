'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { Movie, TMDBImage } from '@/types/tmdb';
import { getImageUrl, getGenreNames } from '@/lib/tmdb';
import { motion, AnimatePresence } from 'motion/react';
import { PlayButton } from './play-button';

interface HeroBannerProps {
  movies: Movie[];
  logos?: Record<number, TMDBImage>;
}

export function HeroBanner({ movies, logos }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const featuredMovies = movies?.slice(0, 7) || [];

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000); // 7 seconds per slide
    return () => clearInterval(interval);
  }, [currentIndex, featuredMovies.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  if (!movies || movies.length === 0) return null;

  const movie = featuredMovies[currentIndex] || movies[0];
  const displayLogo = logos ? logos[movie.id] : null;

  return (
    <div 
      className="relative w-full overflow-hidden bg-transparent h-[75vh] min-h-[500px] md:h-[92vh] xl:h-[96vh] md:min-h-[600px] select-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Backdrop Image Layer with Bottom Fade Mask */}
          <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_52%,rgba(0,0,0,0.72)_72%,rgba(0,0,0,0.25)_88%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_52%,rgba(0,0,0,0.72)_72%,rgba(0,0,0,0.25)_88%,transparent_100%)]">
            <Image
              src={getImageUrl(movie.backdrop_path, 'original')}
              alt={movie.title || 'Hero Background'}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
              referrerPolicy="no-referrer"
            />
            {/* Subtle top shading */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent z-10 pointer-events-none" />

            {/* Subtle left shading */}
            <div className="absolute inset-0 w-full md:w-2/3 bg-gradient-to-r from-black/55 via-black/15 to-transparent z-10 pointer-events-none" />
          </div>

          {/* Hero Text & Action Content Wrapper */}
          <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 md:px-10 lg:px-[max(3rem,calc((100vw-1440px)/2+48px))] pb-20 md:pb-24 w-full md:w-3/4 lg:w-2/3 z-20">
            <div>
              {/* Title Logo or Heading */}
              {displayLogo ? (
                <div className="relative w-48 sm:w-64 md:w-80 h-16 sm:h-20 md:h-28 mb-2 sm:mb-3">
                  <Image 
                    src={getImageUrl(displayLogo.file_path, 'w500')} 
                    alt={movie.title}
                    fill
                    className="object-contain object-left-bottom drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
                  />
                </div>
              ) : (
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 line-clamp-2 uppercase tracking-tight text-white leading-[1.1] drop-shadow-md">
                  {movie.title}
                </h1>
              )}
              
              {/* Metadata Row */}
              <div className="flex items-center flex-wrap mb-4 sm:mb-6 text-[12px] sm:text-[14px] md:text-[15px] gap-1.5 sm:gap-2 md:gap-3 font-semibold text-zinc-300">
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                  <Icons.star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 fill-red-500" />
                  <span className="text-red-400 font-bold">{movie.vote_average?.toFixed(1)}</span>
                </div>
                {movie.release_date && (
                  <>
                    <span className="text-zinc-500 font-bold">&bull;</span>
                    <span className="bg-black/30 backdrop-blur-md px-2 py-0.5 rounded border border-white/5">
                      {movie.release_date.substring(0, 4)}
                    </span>
                  </>
                )}
                {getGenreNames(movie.genre_ids).slice(0, 3).map((genre) => (
                  <div key={genre} className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                    <span className="text-zinc-500 font-bold">&bull;</span>
                    <span className="text-zinc-300">{genre}</span>
                  </div>
                ))}
              </div>

              {/* Overview Description */}
              <p className="text-white/80 text-[13px] sm:text-sm md:text-lg line-clamp-3 mb-6 sm:mb-8 max-w-xl leading-relaxed font-normal drop-shadow">
                {movie.overview}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <PlayButton 
                  type="movie"
                  mediaId={movie.id.toString()}
                  title={movie.title}
                  className="bg-gradient-to-b from-white to-zinc-200 text-black ring-1 ring-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_2px_6px_rgba(0,0,0,0.3)] px-6 sm:px-7 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-[15px] flex items-center justify-center gap-2 hover:from-white hover:to-zinc-100 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-all duration-200 shrink-0 h-[42px] sm:h-[46px]"
                >
                  <Icons.play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                  <span>Play</span>
                </PlayButton>
                <Link 
                  href={`/movie/${movie.id}`}
                  prefetch={false}
                  className="bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-2xl text-white ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),_0_2px_6px_rgba(0,0,0,0.3)] px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-[15px] flex items-center justify-center gap-2 hover:from-white/20 hover:to-white/10 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 shrink-0 h-[42px] sm:h-[46px]"
                >
                  <Icons.info className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>See More</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Animated Pill Pagination Indicators at bottom-right */}
      {featuredMovies.length > 1 && (
        <div className="absolute bottom-6 md:bottom-10 right-4 sm:right-6 md:right-10 lg:right-[max(3rem,calc((100vw-1440px)/2+48px))] z-20 flex justify-end items-center gap-1.5 sm:gap-2 md:gap-2.5">
          {featuredMovies.map((m, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={m.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative flex items-center justify-start rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-8 sm:w-11 md:w-14 h-1.5 md:h-2 bg-white/20 overflow-hidden shadow-sm'
                    : 'w-1.5 sm:w-2 md:w-2.5 h-1.5 md:h-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`Slide ${idx + 1}: ${m.title}`}
                aria-label={`Slide ${idx + 1}`}
              >
                {isActive && (
                  <motion.span
                    key={`timer-${m.id}-${currentIndex}`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 7, ease: 'linear' }}
                    className="absolute inset-y-0 left-0 bg-red-600 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
