import Image from 'next/image';
import Link from 'next/link';
import { fetchTMDB, getImageUrl } from '@/lib/tmdb';
import { TVShowDetails, Credits, TMDBResponse, TVShow, Video, TMDBImages } from '@/types/tmdb';
import { Icons } from '@/components/ui/icons';
import { WatchlistButton } from '@/components/features/watchlist-button';
import { MediaCarousel } from '@/components/features/media-carousel';
import { CastCarousel } from '@/components/features/cast-carousel';
import { BackButton } from '@/components/features/back-button';
import { PlayButton } from '@/components/features/play-button';
import { TrailerButton } from '@/components/features/trailer-button';
import { TrailersCarousel } from '@/components/features/trailers-carousel';
import { EpisodesSection } from '@/components/features/episodes-section';
import { WatchProviders } from '@/components/features/watch-providers';
import { HeroDetailOverlay } from '@/components/features/hero-detail-overlay';
import { EmbeddedVideoPlayer } from '@/components/features/embedded-video-player';
import { TrackHistory } from '@/components/features/track-history';

interface TVDetailContentProps {
  slug: string[];
  searchParams?: Record<string, string | undefined>;
  isModal?: boolean;
}

export async function TVDetailContent({ slug, searchParams, isModal = false }: TVDetailContentProps) {
  const id = slug[0];
  const seasonNum = slug[1] || searchParams?.season || '1';
  const episodeNum = slug[2] || searchParams?.episode || '1';
  
  if (!process.env.TMDB_API_KEY) {
    return <div className="pt-32 text-center text-red-400">API Key missing. Cannot fetch TMDB.</div>;
  }

  let show, credits, similar, recommendations, videos, images, watchProviders;
  try {
    [show, credits, similar, recommendations, videos, images, watchProviders] = await Promise.all([
      fetchTMDB<TVShowDetails>(`/tv/${id}`),
      fetchTMDB<Credits>(`/tv/${id}/credits`),
      fetchTMDB<TMDBResponse<TVShow>>(`/tv/${id}/similar`),
      fetchTMDB<TMDBResponse<TVShow>>(`/tv/${id}/recommendations`).catch(() => ({ results: [], page: 1, total_pages: 1, total_results: 0 })),
      fetchTMDB<{ results: Video[] }>(`/tv/${id}/videos`),
      fetchTMDB<TMDBImages>(`/tv/${id}/images`, { include_image_language: 'en,null' }).catch(() => ({} as TMDBImages)),
      fetchTMDB<any>(`/tv/${id}/watch/providers`).catch(() => ({})),
    ]);
  } catch (error) {
    console.error(`Error fetching tv show ${id}:`, error);
    return (
      <div className="pt-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">Service Temporarily Unavailable</h1>
        <p className="text-zinc-400 max-w-lg mx-auto mb-8 text-lg">
          We are currently experiencing high traffic or performing background catalog updates. Please try again in a few moments.
        </p>
        <Link href="/" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors duration-200">
          Return to Homepage
        </Link>
      </div>
    );
  }

  const moreLikeThisMap = new Map<number, TVShow>();
  [...recommendations.results, ...similar.results].forEach((m) => {
    if (!moreLikeThisMap.has(m.id)) {
      moreLikeThisMap.set(m.id, m);
    }
  });
  const moreLikeThis = Array.from(moreLikeThisMap.values());

  const validSeasons = show.seasons?.filter((s) => s.season_number > 0) || [];
  const currentSeasonNum = Number(seasonNum) || 1;
  const initialSeasonsToFetch = validSeasons.filter(
    (s) => s.season_number === currentSeasonNum || s.season_number === 1
  );
  const allSeasonsData = await Promise.all(
    initialSeasonsToFetch.map((s) => fetchTMDB<any>(`/tv/${id}/season/${s.season_number}`).catch(() => null))
  );

  const trailer = videos.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube') || videos.results[0];
  const mainCast = credits.cast.slice(0, 25);
  const logo = images.logos?.length > 0 ? images.logos[0] : null;

  const tvJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: show.name,
    description: show.overview,
    image: show.poster_path ? getImageUrl(show.poster_path, 'original') : undefined,
    numberOfSeasons: show.number_of_seasons,
    numberOfEpisodes: show.number_of_episodes,
    actor: mainCast.slice(0, 5).map((c) => ({
      '@type': 'Person',
      name: c.name,
    })),
    genre: show.genres?.map((g) => g.name),
    potentialAction: {
      '@type': 'WatchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cinebyfree.co'}/tv/${show.id}`,
    },
    trailer: trailer?.key ? {
      '@type': 'VideoObject',
      name: `${show.name} Official Trailer`,
      description: `Watch the official trailer for ${show.name} on Cineby.`,
      thumbnailUrl: `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${trailer.key}`,
      uploadDate: show.first_air_date,
    } : undefined,
    aggregateRating: show.vote_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: show.vote_average,
      bestRating: 10,
      ratingCount: show.vote_count,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Cineby',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cinebyfree.co',
    },
  };

  return (
    <div className="relative w-full min-h-screen bg-zinc-950 pb-24 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tvJsonLd) }}
      />
      <TrackHistory 
        mediaId={show.id}
        type="tv"
        title={show.name}
        poster_path={show.poster_path}
        backdrop_path={show.backdrop_path}
        season={Number(seasonNum)}
        episode={Number(episodeNum)}
      />
      <BackButton isModal={isModal} />
      
      {/* Hero Banner Backdrop - Full Screen Viewport */}
      <div className="relative w-full overflow-hidden bg-transparent h-screen min-h-[650px] md:min-h-[750px] select-none">
        <EmbeddedVideoPlayer 
          videoKey={trailer?.key}
          fallbackImage={getImageUrl(show.backdrop_path, 'original')}
          title={show.name}
        />
        <HeroDetailOverlay 
          logo={
            logo ? (
              <div className="relative w-48 md:w-80 h-24 md:h-32">
                <Image 
                  src={getImageUrl(logo.file_path, 'w500')} 
                  alt={show.name}
                  fill
                  className="object-contain object-left-bottom drop-shadow-2xl"
                />
              </div>
            ) : (
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white">
                {show.name}
              </h1>
            )
          }
          stats={
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-semibold text-zinc-400">
              {show.vote_average > 0 && (
                <div className="flex items-center gap-1.5">
                  <Icons.star className="w-4 h-4 text-red-500 fill-red-500 mb-[1px]" />
                  <span className="text-red-400 font-semibold">{show.vote_average.toFixed(1)}</span>
                </div>
              )}
              {show.vote_average > 0 && <span>&bull;</span>}
              {show.first_air_date && (
                <>
                  <span>{new Date(show.first_air_date).getFullYear()}</span>
                  <span>&bull;</span>
                </>
              )}
              <span>{show.number_of_seasons} Seasons</span>
              {show.genres?.length > 0 && (
                <>
                  <span>&bull;</span>
                  <div className="flex flex-wrap gap-2">
                    {show.genres.slice(0, 3).map((g) => (
                      <span key={g.id} className="text-zinc-300">
                        {g.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          }
          description={
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-xl font-normal line-clamp-3">
              {show.overview}
            </p>
          }
          buttons={
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5 sm:gap-3 pt-2 w-full flex-wrap sm:flex-nowrap">
                <PlayButton 
                  type="tv" 
                  mediaId={show.id.toString()} 
                  season={Number(seasonNum)} 
                  episode={Number(episodeNum) || 1} 
                  trailerKey={trailer?.key}
                  title={show.name}
                  className="bg-gradient-to-b from-white to-zinc-200 text-black ring-1 ring-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_2px_6px_rgba(0,0,0,0.3)] px-7 py-3 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 hover:from-white hover:to-zinc-100 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-all duration-200 shrink-0 h-[46px]"
                >
                  <Icons.play className="w-5 h-5 fill-black" />
                  <span>Play</span>
                </PlayButton>
                {trailer?.key && (
                  <TrailerButton 
                    trailerKey={trailer.key}
                    title={show.name}
                    mediaInfo={{ 
                      type: 'tv', 
                      mediaId: show.id.toString(), 
                      season: Number(seasonNum), 
                      episode: Number(episodeNum) || 1 
                    }}
                  />
                )}
                <WatchlistButton media={{ ...show, media_type: 'tv', genre_ids: show.genres?.map((g) => g.id) || [] }} className="shrink-0" iconOnly />
                
                <a href="#episodes" className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_6px_rgba(0,0,0,0.3)] text-white font-medium text-[14px] md:text-[15px] px-5 py-2.5 rounded-full flex items-center justify-center gap-2 hover:from-white/15 hover:to-white/10 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 shrink-0 h-[46px]">
                  <Icons.listOrdered className="w-4 h-4" />
                  <span>Episodes</span>
                </a>
                
                <a href="#similar" className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_6px_rgba(0,0,0,0.3)] text-white font-medium text-[14px] md:text-[15px] px-5 py-2.5 rounded-full flex items-center justify-center gap-2 hover:from-white/15 hover:to-white/10 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 shrink-0 h-[46px]">
                  <Icons.sparkles className="w-4 h-4" />
                  <span>Similars</span>
                </a>
              </div>
              <WatchProviders providers={watchProviders} />
            </div>
          }
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-12 max-w-[1440px] relative z-20 space-y-12 md:space-y-16 mt-6 sm:mt-8 md:mt-10">
        <div className="w-full space-y-12">
          {show.seasons && show.seasons.filter((s) => s.season_number > 0).length > 0 && (
            <EpisodesSection 
              show={show} 
              allSeasonsData={allSeasonsData} 
              seasonNum={seasonNum} 
              episodeNum={episodeNum} 
            />
          )}

          {videos.results?.length > 0 && (
            <TrailersCarousel 
              videos={videos.results} 
              mediaTitle={show.name}
              mediaInfo={{ type: 'tv', mediaId: show.id.toString() }}
            />
          )}

          {mainCast.length > 0 && (
            <div className="pt-4">
              <CastCarousel cast={mainCast} title="Top Cast" />
            </div>
          )}
        </div>
        
        {moreLikeThis.length > 0 && (
          <div id="similar" className="relative scroll-mt-24">
            <MediaCarousel title="Similars" items={moreLikeThis.map((m) => ({ ...m, media_type: 'tv' }))} />
          </div>
        )}
      </div>
    </div>
  );
}
