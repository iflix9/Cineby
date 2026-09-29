import { Suspense } from "react";
import { fetchTMDB } from "@/lib/tmdb";
import {
  TMDBResponse,
  Movie,
  TVShow,
  TMDBImages,
  TMDBImage,
  Media,
} from "@/types/tmdb";
import { HeroBanner } from "@/components/features/hero-banner";
import { MediaCarousel } from "@/components/features/media-carousel";
import { ContinueWatchingRow } from "@/components/features/continue-watching-row";

export const revalidate = 14400;

export const metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function Home() {
  let trendingAll: Media[] = [];
  let trendingMovies: Movie[] = [];
  let animeShows: TVShow[] = [];
  let tvAiringShows: TVShow[] = [];
  let upcomingMovies: Movie[] = [];
  let heroLogos: Record<number, TMDBImage> = {};
  let kDramas: TVShow[] = [];
  let errorMsg = "";

  try {
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgoDate = new Date();
    sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7);
    const sevenDaysAgo = sevenDaysAgoDate.toISOString().split("T")[0];

    const [
      trendingAllRes,
      trendingRes,
      animeRes,
      tvAiringRes,
      upcomingRes,
      kDramasRes,
    ] = await Promise.all([
      fetchTMDB<TMDBResponse<Media>>("/trending/all/day"),
      fetchTMDB<TMDBResponse<Movie>>("/trending/movie/day"),
      fetchTMDB<TMDBResponse<TVShow>>("/discover/tv", {
        with_original_language: "ja",
        with_genres: "16",
        sort_by: "popularity.desc",
      }),
      fetchTMDB<TMDBResponse<TVShow>>("/discover/tv", {
        with_original_language: "en",
        with_genres: "18",
        without_genres: "16,10763,10764,10767,99",
        "air_date.gte": sevenDaysAgo,
        "air_date.lte": today,
        sort_by: "popularity.desc",
      }),
      fetchTMDB<TMDBResponse<Movie>>("/movie/upcoming"),
      fetchTMDB<TMDBResponse<TVShow>>("/discover/tv", {
        with_original_language: "ko",
        with_genres: "18",
        "air_date.gte": sevenDaysAgo,
        "air_date.lte": today,
        "vote_count.gte": "1",
        sort_by: "popularity.desc",
      }),
    ]);

    trendingAll = trendingAllRes.results;
    trendingMovies = trendingRes.results;
    animeShows = animeRes.results;
    tvAiringShows = (tvAiringRes.results || []).filter(
      (show) => !show.genre_ids?.some((g) => [16, 10763, 10764, 10767, 99].includes(g))
    );
    upcomingMovies = upcomingRes.results;
    kDramas = kDramasRes.results;

    if (trendingMovies?.length > 0) {
      const top7 = trendingMovies.slice(0, 7);
      const imagesPromises = top7.map((m) =>
        fetchTMDB<TMDBImages>(`/movie/${m.id}/images`, {
          include_image_language: "en,null",
        }).catch(() => null),
      );
      const imagesResults = await Promise.all(imagesPromises);

      imagesResults.forEach((images, index) => {
        if (images && images.logos?.length > 0) {
          heroLogos[top7[index].id] = images.logos[0];
        }
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      errorMsg = error.message;
    } else {
      errorMsg = "An error occurred while fetching data.";
    }
  }

  // Fallback if TMDB API is not set or failing
  if (errorMsg || trendingMovies.length === 0) {
    return (
      <div className="pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[50vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Cineby</h1>
        <p className="text-neutral-400 max-w-lg mx-auto mb-8">
          {errorMsg || "We couldn't connect to TMDB to load content."}
        </p>
        <div className="p-6 bg-neutral-900 rounded-xl border border-neutral-800 text-left max-w-2xl w-full">
          <h3 className="font-semibold text-lg mb-2 text-white">
            How to fix this:
          </h3>
          <ol className="list-decimal pl-5 space-y-2 text-neutral-300 text-sm">
            <li>
              Create an account at <strong>themoviedb.org</strong>
            </li>
            <li>Generate an API Key (v3 auth) in your settings</li>
            <li>
              Open the AI Studio Settings menu and add <code>TMDB_API_KEY</code>{" "}
              to your secrets
            </li>
            <li>Reload this application</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="sr-only">Cineby - Watch Free Movies, TV Shows, Anime & Trailers Online</h1>
      <HeroBanner movies={trendingMovies.slice(0, 7)} logos={heroLogos} />
      <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-12 max-w-[1440px] relative z-20 mt-6 sm:mt-8 md:mt-12 space-y-12 md:space-y-16 mb-6 sm:mb-8 md:mb-10">
        <ContinueWatchingRow />
        <MediaCarousel title="Trending Today" items={trendingAll} />
        <MediaCarousel
          title="K-Dramas Airing This Week"
          items={kDramas.map((t) => ({ ...t, media_type: "tv" }))}
        />
        <MediaCarousel
          title="TV Shows Airing This Week"
          items={tvAiringShows.map((t) => ({ ...t, media_type: "tv" }))}
        />
        <MediaCarousel
          title="Popular Anime"
          items={animeShows.map((a) => ({ ...a, media_type: "tv" }))}
        />
        <MediaCarousel title="Upcoming Movies" items={upcomingMovies} />
      </div>
    </div>
  );
}
