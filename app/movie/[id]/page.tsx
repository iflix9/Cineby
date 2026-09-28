import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchTMDB, getImageUrl, isBlockedMedia } from '@/lib/tmdb';
import { MovieDetails, Credits, TMDBResponse, Movie, Video, TMDBImages } from '@/types/tmdb';
import { Icons } from '@/components/ui/icons';
import { WatchlistButton } from '@/components/features/watchlist-button';
import { MediaCarousel } from '@/components/features/media-carousel';
import { BackButton } from '@/components/features/back-button';
import { PlayButton } from '@/components/features/play-button';
import { WatchProviders } from '@/components/features/watch-providers';

import { HeroDetailOverlay } from '@/components/features/hero-detail-overlay';
import { EmbeddedVideoPlayer } from '@/components/features/embedded-video-player';
import { TrackHistory } from '@/components/features/track-history';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isBlockedMedia(id, 'movie')) {
    return { title: 'Content Unavailable' };
  }
  try {
    const movie = await fetchTMDB<MovieDetails>(`/movie/${id}`);
    return {
      title: movie.title,
      description: movie.overview,
    };
  } catch {
    return { title: 'Movie Not Found' };
  }
}

export default async function MoviePage(props: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { id } = await props.params;

  if (isBlockedMedia(id, 'movie')) {
    notFound();
  }

  if (!process.env.TMDB_API_KEY) {
     return <div className="pt-32 text-center text-red-400">API Key missing. Cannot fetch TMDB.</div>
  }

  let movie, credits, similar, recommendations, videos, images, watchProviders;
  try {
    [movie, credits, similar, recommendations, videos, images, watchProviders] = await Promise.all([
      fetchTMDB<MovieDetails>(`/movie/${id}`),
      fetchTMDB<Credits>(`/movie/${id}/credits`),
      fetchTMDB<TMDBResponse<Movie>>(`/movie/${id}/similar`),
      fetchTMDB<TMDBResponse<Movie>>(`/movie/${id}/recommendations`).catch(() => ({ results: [], page: 1, total_pages: 1, total_results: 0 })),
      fetchTMDB<{results: Video[]}>(`/movie/${id}/videos`),
      fetchTMDB<TMDBImages>(`/movie/${id}/images`, { include_image_language: 'en,null' }).catch(() => ({} as TMDBImages)),
      fetchTMDB<any>(`/movie/${id}/watch/providers`).catch(() => ({}))
    ]);
  } catch (error) {
    console.error(`Error fetching movie ${id}:`, error);
    return (
      <div className="pt-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">Service Temporarily Unavailable</h1>
        <p className="text-zinc-400 max-w-lg mx-auto mb-8 text-lg">
          We are currently experiencing high traffic or performing background database syncs. Please try again in a few moments.
        </p>
        <Link href="/" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors duration-200">
          Return to Homepage
        </Link>
      </div>
    );
  }

  const moreLikeThisMap = new Map<number, Movie>();
  [...recommendations.results, ...similar.results].forEach((m) => {
    if (!moreLikeThisMap.has(m.id)) {
      moreLikeThisMap.set(m.id, m);
    }
  });
  const moreLikeThis = Array.from(moreLikeThisMap.values());

  const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.results[0];
  const mainCast = credits.cast.slice(0, 10);
  const director = credits.crew.find(c => c.job === 'Director');
  const logo = images.logos?.length > 0 ? images.logos[0] : null;

  return (
    <div className="relative w-full min-h-screen bg-zinc-950 pb-24 md:pb-32">
      <TrackHistory 
        mediaId={movie.id}
        type="movie"
        title={movie.title}
        poster_path={movie.poster_path}
        backdrop_path={movie.backdrop_path}
      />
      <BackButton />
      
      {/* Hero Banner Backdrop */}
      <div className="relative w-full h-[75vh] md:h-[85vh] bg-zinc-950 overflow-hidden">
           <EmbeddedVideoPlayer 
             videoKey={trailer?.key}
             fallbackImage={getImageUrl(movie.backdrop_path, 'original')}
             title={movie.title}
           />
           <HeroDetailOverlay 
              logo={
                 logo ? (
                   <div className="relative w-48 md:w-80 h-24 md:h-32">
                      <Image 
                         src={getImageUrl(logo.file_path, 'w500')} 
                         alt={movie.title}
                         fill
                         className="object-contain object-left-bottom drop-shadow-2xl"
                      />
                   </div>
                ) : (
                   <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white">
                      {movie.title}
                   </h1>
                )
              }
              stats={
                 <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-semibold text-zinc-400">
                    {movie.vote_average > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Icons.star className="w-4 h-4 text-red-500 fill-red-500 mb-[1px]" />
                        <span className="text-red-400 font-semibold">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                    {movie.vote_average > 0 && <span>&bull;</span>}
                    {movie.release_date && (
                      <>
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                        <span>&bull;</span>
                      </>
                    )}
                    {movie.runtime && movie.runtime > 0 && (
                      <>
                      <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                    </>
                  )}
                  {movie.genres?.length > 0 && (
                    <>
                      <span>&bull;</span>
                      <div className="flex flex-wrap gap-2">
                         {movie.genres.slice(0, 3).map(g => (
                            <span key={g.id} className="text-zinc-300">
                               {g.name}
                            </span>
                         ))}
                      </div>
                    </>
                  )}
                  {director && (
                    <span className="hidden">
                      <span>&bull;</span>
                      <span>Dir. {director.name}</span>
                    </span>
                  )}
               </div>
              }
              description={
                 <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-xl font-normal line-clamp-3">
                    {movie.overview}
                 </p>
              }
              buttons={
                 <div className="flex flex-col">
                   <div className="flex items-center gap-2 sm:gap-3 pt-2 w-full overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                     <PlayButton 
                       type="movie" 
                       mediaId={movie.id.toString()} 
                       trailerKey={trailer?.key}
                       title={movie.title}
                       className="bg-gradient-to-b from-white to-zinc-200 text-black ring-1 ring-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_2px_6px_rgba(0,0,0,0.3)] px-7 py-3 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 hover:from-white hover:to-zinc-100 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-all duration-200 shrink-0 h-[46px]"
                     >
                       <Icons.play className="w-5 h-5 fill-black" />
                       <span>Play</span>
                     </PlayButton>
                     <WatchlistButton media={{...movie, media_type: 'movie', genre_ids: movie.genres?.map(g => g.id) || []}} className="shrink-0" iconOnly />
                     <button className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_6px_rgba(0,0,0,0.3)] text-white font-medium text-[14px] md:text-[15px] w-[46px] sm:w-auto px-0 sm:px-5 py-2.5 rounded-full flex items-center justify-center gap-2 hover:from-white/15 hover:to-white/10 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 shrink-0 h-[46px]">
                       <Icons.download className="w-4 h-4" />
                       <span className="hidden sm:inline">Download</span>
                     </button>
                     <a href="#similar" className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_6px_rgba(0,0,0,0.3)] text-white font-medium text-[14px] md:text-[15px] w-[46px] sm:w-auto px-0 sm:px-5 py-2.5 rounded-full flex items-center justify-center gap-2 hover:from-white/15 hover:to-white/10 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 shrink-0 h-[46px]">
                       <Icons.sparkles className="w-4 h-4" />
                       <span className="hidden sm:inline">Similars</span>
                     </a>
                   </div>
                   <WatchProviders providers={watchProviders} />
                 </div>
              }
           />
        </div>
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-8 space-y-12 mt-4">
         <div className="w-full space-y-12">
            <div>
              <h2 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-white mb-6">
                 <div className="w-1 h-5 md:h-6 bg-red-600 rounded-sm"></div>
                 Top Cast
              </h2>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                 {mainCast.map(actor => (
                   <Link href={`/person/${actor.id}`} prefetch={false} key={actor.id} className="w-[120px] md:w-[140px] shrink-0 group flex flex-col cursor-pointer">
                      <div className="aspect-[2/3] relative w-full rounded-xl overflow-hidden bg-neutral-900 border border-zinc-800/50 group-hover:border-zinc-700 transition-colors">
                         {actor.profile_path ? (
                           <Image 
                             src={getImageUrl(actor.profile_path)}
                             alt={actor.name}
                             fill
                             className="object-cover transition-transform duration-500 group-hover:scale-105"
                             referrerPolicy="no-referrer"
                           />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-neutral-800">
                             <span className="text-xs">No Image</span>
                           </div>
                         )}
                      </div>
                      <div className="mt-2 space-y-0.5 text-center md:text-left">
                         <div className="text-sm font-semibold text-white tracking-wide truncate max-w-[120px] group-hover:text-red-500 transition-colors">
                           {actor.name}
                         </div>
                         <div className="text-xs font-medium text-zinc-400 truncate max-w-[120px]">
                           {actor.character}
                         </div>
                      </div>
                   </Link>
                 ))}
              </div>
            </div>
         </div>
      </div>
      
      {moreLikeThis.length > 0 && (
        <div id="similar" className="mt-8 relative z-20 scroll-mt-24">
          <MediaCarousel title="More Like This" items={moreLikeThis.map(m => ({...m, media_type: 'movie'}))} />
        </div>
      )}
    </div>
  );
}
