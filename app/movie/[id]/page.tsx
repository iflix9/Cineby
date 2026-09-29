import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchTMDB, getImageUrl, isBlockedMedia } from '@/lib/tmdb';
import { MovieDetails, Credits, TMDBResponse, Movie, Video, TMDBImages } from '@/types/tmdb';
import { Icons } from '@/components/ui/icons';
import { WatchlistButton } from '@/components/features/watchlist-button';
import { MediaCarousel } from '@/components/features/media-carousel';
import { CastCarousel } from '@/components/features/cast-carousel';
import { BackButton } from '@/components/features/back-button';
import { PlayButton } from '@/components/features/play-button';
import { WatchProviders } from '@/components/features/watch-providers';

import { HeroDetailOverlay } from '@/components/features/hero-detail-overlay';
import { EmbeddedVideoPlayer } from '@/components/features/embedded-video-player';
import { TrackHistory } from '@/components/features/track-history';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isBlockedMedia(id, 'movie')) {
    return { title: 'Content Unavailable - Cineby' };
  }
  try {
    const movie = await fetchTMDB<MovieDetails>(`/movie/${id}`);
    const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : '';
    const titleText = `${movie.title}${releaseYear ? ` (${releaseYear})` : ''} - Watch Free on Cineby`;
    const descText = movie.overview
      ? `${movie.overview.slice(0, 155)}... Watch ${movie.title} and explore cast, reviews, and trailers on Cineby.`
      : `Watch ${movie.title} on Cineby. Free movies and cinema database.`;
    const poster = getImageUrl(movie.poster_path, 'original');

    return {
      title: titleText,
      description: descText,
      alternates: {
        canonical: `/movie/${id}`,
      },
      openGraph: {
        title: titleText,
        description: descText,
        images: movie.poster_path ? [{ url: poster, alt: movie.title }] : [],
        type: 'video.movie',
        siteName: 'Cineby',
      },
      twitter: {
        card: 'summary_large_image',
        title: titleText,
        description: descText,
        images: movie.poster_path ? [poster] : [],
      },
    };
  } catch {
    return { title: 'Movie - Cineby' };
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
  const mainCast = credits.cast.slice(0, 25);
  const director = credits.crew.find(c => c.job === 'Director');
  const logo = images.logos?.length > 0 ? images.logos[0] : null;

  const movieJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.overview,
    image: movie.poster_path ? getImageUrl(movie.poster_path, 'original') : undefined,
    datePublished: movie.release_date,
    director: director ? { '@type': 'Person', name: director.name } : undefined,
    actor: mainCast.slice(0, 5).map(c => ({
      '@type': 'Person',
      name: c.name,
    })),
    aggregateRating: movie.vote_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: movie.vote_average,
      bestRating: 10,
      ratingCount: movie.vote_count,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Cineby',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://cinebyfree.co',
    },
  };

  return (
    <div className="relative w-full min-h-screen bg-zinc-950 pb-24 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(movieJsonLd) }}
      />
      <TrackHistory 
        mediaId={movie.id}
        type="movie"
        title={movie.title}
        poster_path={movie.poster_path}
        backdrop_path={movie.backdrop_path}
      />
      <BackButton />
      
      {/* Hero Banner Backdrop */}
      <div className="relative w-full overflow-hidden bg-transparent h-[75vh] min-h-[500px] md:h-[85vh] xl:h-[90vh] md:min-h-[600px] select-none">
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
                   <div className="flex items-center gap-2.5 sm:gap-3 pt-2 w-full flex-wrap sm:flex-nowrap">
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
                     <a href="#similar" className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_6px_rgba(0,0,0,0.3)] text-white font-medium text-[14px] md:text-[15px] px-5 py-2.5 rounded-full flex items-center justify-center gap-2 hover:from-white/15 hover:to-white/10 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 shrink-0 h-[46px]">
                       <Icons.sparkles className="w-4 h-4" />
                       <span>More Like This</span>
                     </a>
                   </div>
                   <WatchProviders providers={watchProviders} />
                 </div>
              }
           />
        </div>
      <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-12 max-w-[1440px] relative z-20 space-y-12 md:space-y-16 mt-6 sm:mt-8 md:mt-10">
         <div className="w-full space-y-12">
            {mainCast.length > 0 && (
              <CastCarousel cast={mainCast} title="Top Cast" />
            )}
         </div>
         
         {moreLikeThis.length > 0 && (
           <div id="similar" className="relative scroll-mt-24">
             <MediaCarousel title="More Like This" items={moreLikeThis.map(m => ({...m, media_type: 'movie'}))} />
           </div>
         )}
      </div>
    </div>
  );
}
