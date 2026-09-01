'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { Movie, TMDBImage } from '@/types/tmdb';
import { getImageUrl, getGenreNames } from '@/lib/tmdb';
import { motion, AnimatePresence } from 'motion/react';
import { triggerAdPopUp } from '@/lib/ad';

interface HeroBannerProps {
  movies: Movie[];
  logos?: Record<number, TMDBImage>;
}

export function HeroBanner({ movies, logos }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 5));
    }, 12000); // 12 seconds
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex];
  const displayLogo = logos ? logos[movie.id] : null;

  return (
    <div className="relative h-[85vh] md:h-[90vh] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0">
            <Image
              src={getImageUrl(movie.backdrop_path, 'original')}
              alt={movie.title || 'Hero Background'}
              fill
              priority
              className="object-cover object-top"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-48 md:h-64 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
          </div>

          <div className="absolute bottom-[20%] left-4 md:left-16 max-w-xl z-20 space-y-4">
            {displayLogo ? (
               <div className="relative w-48 md:w-80 h-24 md:h-32 mb-4">
                  <Image 
                     src={getImageUrl(displayLogo.file_path, 'w500')} 
                     alt={movie.title}
                     fill
                     className="object-contain object-left-bottom drop-shadow-2xl"
                  />
               </div>
            ) : (
               <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-4">
                 {movie.title}
               </h1>
            )}
            
            <div className="flex items-center flex-wrap gap-2 md:gap-2.5 text-xs md:text-sm font-medium text-zinc-300 mb-4">
              <div className="flex items-center gap-1.5">
                <Icons.star className="w-4 h-4 text-red-500 fill-red-500 mb-[1px]" />
                <span className="text-red-400 font-semibold">{movie.vote_average?.toFixed(1)}</span>
              </div>
              <span className="text-zinc-600 font-bold">&middot;</span>
              <span>{movie.release_date?.substring(0, 4)}</span>
              {getGenreNames(movie.genre_ids).slice(0, 3).map((genre) => (
                <div key={genre} className="flex items-center gap-2 md:gap-2.5">
                  <span className="text-zinc-600 font-bold">&middot;</span>
                  <span>{genre}</span>
                </div>
              ))}
            </div>

            <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-lg font-normal mb-8 line-clamp-3">
              {movie.overview}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  triggerAdPopUp();
                  import('./player-overlay').then(({ playMedia }) => {
                    playMedia('movie', movie.id.toString());
                  });
                }}
                className="bg-white text-black px-6 md:px-8 py-2.5 rounded-full font-bold text-sm md:text-base flex items-center gap-2 hover:bg-zinc-200 transition"
              >
                <Icons.play className="w-5 h-5 fill-black" />
                Play
              </button>
              <Link 
                href={`/movie/${movie.id}`}
                prefetch={false}
                className="bg-zinc-800/60 backdrop-blur-sm text-white border border-zinc-700/50 px-6 md:px-8 py-2.5 rounded-full font-semibold text-sm md:text-base flex items-center gap-2 hover:bg-zinc-700 transition"
              >
                <Icons.info className="w-5 h-5" />
                See More
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>


    </div>
  );
}
