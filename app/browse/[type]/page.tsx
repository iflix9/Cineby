import { fetchTMDB } from '@/lib/tmdb';
import { TMDBResponse, Media } from '@/types/tmdb';
import { BrowseClient } from './browse-client';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface BrowsePageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: BrowsePageProps): Promise<Metadata> {
  const { type } = await params;
  const title = type === 'movie' ? 'Movies' : type === 'tv' ? 'TV Shows' : type === 'anime' ? 'Anime' : 'Browse';
  return {
    title: title,
  };
}

export default async function BrowsePage({ params }: BrowsePageProps) {
  const { type } = await params;
  
  if (!['movie', 'tv', 'anime'].includes(type)) {
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
    <div className="pt-24  px-4 sm:px-8 lg:px-12 w-full min-h-screen">
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
