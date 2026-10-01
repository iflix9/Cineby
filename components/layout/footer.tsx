'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/movie') || pathname?.startsWith('/tv')) {
    return null;
  }

  return (
    <footer className="w-full pb-8 md:pb-12 pt-6 md:pt-8 bg-black border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-12 max-w-[1440px]">
        <h2 className="text-xl font-bold text-white mb-2">Cineby</h2>
        <p className="text-xs sm:text-sm text-neutral-400 mb-4 max-w-none lg:max-w-4xl leading-relaxed">
          Cineby is a free cinematic metadata discovery engine powered by TMDB. Browse movies, TV series, anime, and trailers on Cineby. We do not host or store any media files.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/browse/movie"
            className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Movies
          </Link>
          <span className="text-neutral-700">•</span>
          <Link
            href="/browse/tv"
            className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
          >
            TV Shows
          </Link>
          <span className="text-neutral-700">•</span>
          <Link
            href="/browse/anime"
            className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Anime
          </Link>
          <span className="text-neutral-700">•</span>
          <Link
            href="/about"
            className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
          >
            About & Legal
          </Link>
        </div>
      </div>
    </footer>
  );
}
