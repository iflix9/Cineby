import { fetchTMDB } from '@/lib/tmdb';
import { TMDBResponse, Media } from '@/types/tmdb';
import { BrowseClient } from './browse-client';
import { Metadata } from 'next';

export const revalidate = 14400;

interface BrowsePageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: BrowsePageProps): Promise<Metadata> {
  const { type } = await params;
  const config = {
    movie: {
      title: 'Movies',
      desc: 'Discover and browse thousands of popular and trending movies on Cineby. Filter by genre, release year, and country.',
    },
    tv: {
      title: 'TV Shows',
      desc: 'Discover top-rated and trending TV series, seasons, and episodes on Cineby. Updated daily with new releases.',
    },
    anime: {
      title: 'Anime',
      desc: 'Explore popular Japanese anime series, movies, and animations with full metadata and episodes on Cineby.',
    },
    sports: {
      title: 'Sports & Entertainment',
      desc: 'Explore top sports films, athletic documentaries, and sports entertainment on Cineby.',
    },
  }[type] || {
    title: 'Browse',
    desc: 'Explore movies, TV shows, and entertainment on Cineby.',
  };

  const fullTitle = `${config.title} | Cineby`;

  return {
    title: config.title,
    description: config.desc,
    alternates: {
      canonical: `/browse/${type}`,
    },
    openGraph: {
      title: fullTitle,
      description: config.desc,
      siteName: 'Cineby',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: config.desc,
    },
  };
}

export default async function BrowsePage({ params }: BrowsePageProps) {
  const { type } = await params;
  
  if (!['movie', 'tv', 'anime', 'sports'].includes(type)) {
    // notFound();
    return <div>Invalid type</div>;
  }

  let endpoint = '';
  const queryParams: Record<string, string> = {
    sort_by: 'popularity.desc',
  };

  let title = '';

  if (type === 'movie') {
    endpoint = '/discover/movie';
    title = 'Movies';
  } else if (type === 'tv') {
    endpoint = '/discover/tv';
    title = 'TV Shows';
  } else if (type === 'anime') {
    endpoint = '/discover/tv';
    queryParams.with_genres = '16';
    queryParams.with_original_language = 'ja';
    title = 'Anime';
  } else if (type === 'sports') {
    endpoint = '/discover/movie';
    queryParams.with_keywords = '6075|180547|209265';
    title = 'Sports';
  }

  let initialData: TMDBResponse<Media> = { page: 1, results: [], total_pages: 1, total_results: 0 };
  let errorMsg = '';

  try {
    initialData = await fetchTMDB<TMDBResponse<Media>>(endpoint, queryParams);
  } catch (error) {
    if (error instanceof Error) {
      errorMsg = error.message;
    } else {
      errorMsg = "An error occurred while fetching data.";
    }
  }

  return (
    <div className="pt-24 px-4 sm:px-8 lg:px-12 w-full min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      
      {errorMsg ? (
        <div className="text-center text-neutral-500 mt-20">
          <p className="text-lg">Could not load content.</p>
          <p className="text-sm mt-2">{errorMsg}</p>
        </div>
      ) : (
        <BrowseClient initialData={initialData} type={type} endpoint={endpoint} queryParams={queryParams} />
      )}
    </div>
  );
}
