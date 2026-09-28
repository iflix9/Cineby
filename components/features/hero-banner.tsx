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
      className="relative w-full h-[78vh] min-h-[560px] sm:h-[82vh] sm:min-h-[620px] md:h-[86vh] md:min-h-[660px] lg:h-[90vh] lg:min-h-[720px] xl:max-h-[960px] overflow-hidden select-none"
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
          {/* Backdrop Image Layer */}
          <div className="absolute inset-0">
            <Image
              src={getImageUrl(movie.backdrop_path, 'original')}
              alt={movie.title || 'Hero Background'}
              fill
              priority
              className="object-cover object-[center_25%] sm:object-top"
              referrerPolicy="no-referrer"
            />
            {/* Top gradient for navbar contrast */}
            <div className="absolute top-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />

            {/* Horizontal Vignette - enhanced for mobile readability, soft for desktop */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 via-35% to-black/30 sm:via-black/55 sm:via-45% sm:to-transparent z-10 pointer-events-none" />

            {/* Bottom Fade into page content */}
            <div className="absolute bottom-0 inset-x-0 h-48 sm:h-64 md:h-80 bg-gradient-to-t from-black via-black/85 via-40% to-transparent z-10 pointer-events-none" />
          </div>

          {/* Content Wrapper */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 pb-16 sm:pb-20 md:pb-24 lg:pb-28">
              <div className="max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-3 sm:space-y-4">
                {/* Logo or Title */}
                {displayLogo ? (
                  <div className="relative w-44 sm:w-60 md:w-80 lg:w-96 h-16 sm:h-24 md:h-32 mb-2 sm:mb-3">
                    <Image 
                      src={getImageUrl(displayLogo.file_path, 'w500')} 
                      alt={movie.title}
                      fill
                      className="object-contain object-left-bottom drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
                    />
                  </div>
                ) : (
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-2 sm:mb-3 leading-[1.1] drop-shadow-md">
                    {movie.title}
                  </h1>
                )}
                
                {/* Metadata Row */}
                <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 text-xs sm:text-sm font-semibold text-zinc-300">
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
                    <div key={genre} className="flex items-center gap-2 sm:gap-2.5">
                      <span className="text-zinc-500 font-bold">&bull;</span>
                      <span className="text-zinc-300">{genre}</span>
                    </div>
                  ))}
                </div>

                {/* Overview Description */}
                <p className="text-zinc-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl font-normal line-clamp-2 sm:line-clamp-3 md:line-clamp-4 drop-shadow">
                  {movie.overview}
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-2 sm:pt-3">
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
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Controls */}
      {featuredMovies.length > 1 && (
        <div className="absolute bottom-5 sm:bottom-8 md:bottom-10 right-4 sm:right-8 md:right-12 lg:right-16 xl:right-20 z-30 flex items-center gap-1 sm:gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 rounded-full border border-white/10 shadow-lg">
          <button
            onClick={handlePrev}
            className="hidden sm:flex items-center justify-center w-5 h-5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Previous slide"
            aria-label="Previous slide"
          >
            <Icons.chevronLeft className="w-3.5 h-3.5" />
          </button>

          {featuredMovies.map((m, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={m.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative flex items-center justify-start rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-7 sm:w-9 h-1.5 sm:h-2 bg-white/20 overflow-hidden shadow-sm'
                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/30 hover:bg-white/60'
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

          <button
            onClick={handleNext}
            className="hidden sm:flex items-center justify-center w-5 h-5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Next slide"
            aria-label="Next slide"
          >
            <Icons.chevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
