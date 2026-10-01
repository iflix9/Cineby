import Image from 'next/image';
import Link from 'next/link';
import { fetchTMDB, getImageUrl, isBlockedMedia } from '@/lib/tmdb';
import { MovieDetails, Credits, TMDBResponse, Movie, Video, TMDBImages } from '@/types/tmdb';
import { Icons } from '@/components/ui/icons';
import { MediaModalShell } from '@/components/features/media-modal-shell';
import { PlayButton } from '@/components/features/play-button';
import { WatchlistButton } from '@/components/features/watchlist-button';
import { CastCarousel } from '@/components/features/cast-carousel';
import { WatchProviders } from '@/components/features/watch-providers';
import { MediaCarousel } from '@/components/features/media-carousel';

export const revalidate = 86400;

export default async function InterceptedMoviePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  if (isBlockedMedia(id, 'movie')) {
    return null;
  }

  if (!process.env.TMDB_API_KEY) {
    return null;
  }

  let movie: MovieDetails;
  let credits: Credits;
  let similar: TMDBResponse<Movie>;
  let recommendations: TMDBResponse<Movie>;
  let videos: { results: Video[] };
  let images: TMDBImages;
  let watchProviders: any;

  try {
    [movie, credits, similar, recommendations, videos, images, watchProviders] = await Promise.all([
      fetchTMDB<MovieDetails>(`/movie/${id}`),
      fetchTMDB<Credits>(`/movie/${id}/credits`),
      fetchTMDB<TMDBResponse<Movie>>(`/movie/${id}/similar`),
      fetchTMDB<TMDBResponse<Movie>>(`/movie/${id}/recommendations`).catch(() => ({ results: [], page: 1, total_pages: 1, total_results: 0 })),
      fetchTMDB<{ results: Video[] }>(`/movie/${id}/videos`),
      fetchTMDB<TMDBImages>(`/movie/${id}/images`, { include_image_language: 'en,null' }).catch(() => ({} as TMDBImages)),
      fetchTMDB<any>(`/movie/${id}/watch/providers`).catch(() => ({})),
    ]);
  } catch (error) {
    console.error(`Error fetching intercepted movie ${id}:`, error);
    return null;
  }

  const moreLikeThisMap = new Map<number, Movie>();
  [...recommendations.results, ...similar.results].forEach((m) => {
    if (!moreLikeThisMap.has(m.id)) {
      moreLikeThisMap.set(m.id, m);
    }
  });
  const moreLikeThis = Array.from(moreLikeThisMap.values()).slice(0, 15);

  const trailer = videos.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube') || videos.results[0];
  const mainCast = credits.cast.slice(0, 20);
  const logo = images.logos?.length > 0 ? images.logos[0] : null;

  return (
    <MediaModalShell fullPageUrl={`/movie/${id}`}>
      {/* Hero Backdrop Banner */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[380px] overflow-hidden bg-neutral-900 select-none">
        {movie.backdrop_path ? (
          <Image
            src={getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover object-center"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center text-zinc-600">
            <Icons.clapperboard className="w-16 h-16 opacity-30" />
          </div>
        )}

        {/* Gradient Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f11]/90 via-transparent to-transparent hidden sm:block" />

        {/* Floating Quick Info Over Backdrop (Bottom Left) */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-end gap-4 z-20">
          {/* Poster Thumbnail */}
          <div className="relative w-20 sm:w-28 md:w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/15 bg-neutral-900 shrink-0 hidden xs:block">
            {movie.poster_path ? (
              <Image
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                fill
                sizes="130px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <Icons.clapperboard className="w-8 h-8 opacity-40" />
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="flex-1 min-w-0 pb-1">
            {logo ? (
              <div className="relative w-36 sm:w-56 h-14 sm:h-20 mb-2">
                <Image
                  src={getImageUrl(logo.file_path, 'w500')}
                  alt={movie.title}
                  fill
                  className="object-contain object-left-bottom drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-lg line-clamp-2 mb-1.5">
                {movie.title}
              </h1>
            )}

            {/* Badges / Stats */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-300">
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1 text-red-400">
                  <Icons.star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
              )}
              {movie.release_date && (
                <>
                  <span className="text-zinc-600">&bull;</span>
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </>
              )}
              {movie.runtime && movie.runtime > 0 && (
                <>
                  <span className="text-zinc-600">&bull;</span>
                  <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                </>
              )}
              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-white/10 text-zinc-200 border border-white/10">
                HD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3">
          <PlayButton
            type="movie"
            mediaId={String(movie.id)}
            trailerKey={trailer?.key}
            title={movie.title}
            className="flex-1 sm:flex-initial"
          >
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/25 transition-all cursor-pointer"
            >
              <Icons.play className="w-4 h-4 fill-white" />
              <span>Watch Now</span>
            </button>
          </PlayButton>

          <WatchlistButton
            media={{
              ...movie,
              media_type: 'movie',
              genre_ids: movie.genres?.map((g) => g.id) || [],
            }}
          />

          <Link
            href={`/movie/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-750 text-zinc-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors border border-white/5"
          >
            <span>Full Details Page</span>
            <Icons.chevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
        </div>

        {/* Genres Pill Tags */}
        {movie.genres?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <Link
                key={genre.id}
                href={`/browse/movie?genre=${genre.id}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-800/90 text-zinc-300 hover:text-white hover:bg-neutral-700 transition-colors border border-white/5"
              >
                {genre.name}
              </Link>
            ))}
          </div>
        )}

        {/* Synopsis / Overview */}
        {movie.overview && (
          <div className="space-y-1.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Overview
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
              {movie.overview}
            </p>
          </div>
        )}

        {/* Streaming Providers */}
        {watchProviders?.results?.US && (
          <WatchProviders providers={watchProviders.results.US} />
        )}

        {/* Cast Carousel */}
        {mainCast.length > 0 && (
          <div className="pt-2">
            <CastCarousel cast={mainCast} title="Top Cast" />
          </div>
        )}

        {/* Similar / Recommended Titles */}
        {moreLikeThis.length > 0 && (
          <div className="pt-2">
            <MediaCarousel title="More Like This" items={moreLikeThis} />
          </div>
        )}
      </div>
    </MediaModalShell>
  );
}
