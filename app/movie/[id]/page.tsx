import { notFound } from 'next/navigation';
import { fetchTMDB, getImageUrl, isBlockedMedia } from '@/lib/tmdb';
import { MovieDetails } from '@/types/tmdb';
import { MovieDetailContent } from '@/components/features/movie-detail-content';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isBlockedMedia(id, 'movie')) {
    return { title: 'Content Unavailable' };
  }
  try {
    const movie = await fetchTMDB<MovieDetails>(`/movie/${id}`);
    const pageTitle = movie.title;
    const fullOgTitle = `${movie.title} | Cineby`;
    const rawOverview = movie.overview?.trim();
    const descText = rawOverview
      ? (rawOverview.length > 155 ? `${rawOverview.slice(0, 152)}...` : rawOverview)
      : `Discover where to stream ${movie.title}, watch official trailers, ratings, and cast on Cineby.`;
    const poster = getImageUrl(movie.poster_path, 'original');

    return {
      title: pageTitle,
      description: descText,
      alternates: {
        canonical: `/movie/${id}`,
      },
      openGraph: {
        title: fullOgTitle,
        description: descText,
        images: movie.poster_path ? [{ url: poster, alt: movie.title }] : [],
        type: 'video.movie',
        siteName: 'Cineby',
      },
      twitter: {
        card: 'summary_large_image',
        title: fullOgTitle,
        description: descText,
        images: movie.poster_path ? [poster] : [],
      },
    };
  } catch {
    return { title: 'Movie' };
  }
}

export default async function MoviePage(props: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  if (isBlockedMedia(id, 'movie')) {
    notFound();
  }

  return <MovieDetailContent id={id} searchParams={searchParams} isModal={false} />;
}
