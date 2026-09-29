import type { MetadataRoute } from 'next';
import { fetchTMDB } from '@/lib/tmdb';
import { TMDBResponse, Movie, TVShow } from '@/types/tmdb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith('http'))
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'https://www.cinebyfree.co';
  const currentDate = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/browse/movie`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/browse/tv`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/browse/anime`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/watchlist`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/history`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  let movieRoutes: MetadataRoute.Sitemap = [];
  let tvRoutes: MetadataRoute.Sitemap = [];

  try {
    const [trendingMovies, trendingTV] = await Promise.all([
      fetchTMDB<TMDBResponse<Movie>>('/trending/movie/week').catch(() => null),
      fetchTMDB<TMDBResponse<TVShow>>('/trending/tv/week').catch(() => null),
    ]);

    if (trendingMovies?.results) {
      movieRoutes = trendingMovies.results.slice(0, 50).map((movie) => ({
        url: `${baseUrl}/movie/${movie.id}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }

    if (trendingTV?.results) {
      tvRoutes = trendingTV.results.slice(0, 50).map((show) => ({
        url: `${baseUrl}/tv/${show.id}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error('Error generating dynamic sitemap entries:', e);
  }

  return [...staticRoutes, ...movieRoutes, ...tvRoutes];
}
