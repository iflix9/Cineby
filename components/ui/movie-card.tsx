'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { Media, Movie, TVShow } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  media: Media;
  className?: string;
  priority?: boolean;
}

export function MovieCard({ media, className, priority = false }: MovieCardProps) {
  const isMovie = 'title' in media;
  const title = isMovie ? (media as Movie).title : (media as TVShow).name;
  const releaseDate = isMovie ? (media as Movie).release_date : (media as TVShow).first_air_date;
  
  // Provide a safe media type for URLs since the API might not always return media_type in list views
  const linkPath = `/${isMovie ? 'movie' : 'tv'}/${media.id}`;

  return (
    <div className={cn('group relative w-full flex flex-col', className)}>
      <Link href={linkPath} prefetch={false} className="block relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-neutral-900 border border-transparent transition-colors group-hover:border-zinc-800">
        <Image
          src={getImageUrl(media.poster_path, 'w500')}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-full transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <Icons.play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      </Link>
      
      <Link href={linkPath} prefetch={false} className="flex flex-col mt-3 px-1.5">
        <h3 className="font-semibold text-white text-[13px] sm:text-sm md:text-[15px] line-clamp-1 transition-colors duration-200 group-hover:text-red-500">
          {title}
        </h3>
        <div className="flex items-center gap-1 sm:gap-1.5 mt-1 text-[11px] sm:text-xs md:text-[13px] text-zinc-400 font-medium whitespace-nowrap">
          {'vote_average' in media && media.vote_average > 0 && (
            <>
              <div className="flex items-center gap-1 shrink-0">
                <Icons.star className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-red-600 fill-red-600" />
                <span>{media.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-zinc-600 shrink-0">&middot;</span>
            </>
          )}
          {releaseDate && (
            <>
              <span className="shrink-0">{new Date(releaseDate).getFullYear()}</span>
              <span className="text-zinc-600 shrink-0">&middot;</span>
            </>
          )}
          <span>{isMovie ? 'Movie' : 'TV Show'}</span>
        </div>
      </Link>
    </div>
  );
}
