import { fetchTMDB, getImageUrl } from '@/lib/tmdb';
import { TVShowDetails } from '@/types/tmdb';
import { TVDetailContent } from '@/components/features/tv-detail-content';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const id = slug[0];
  try {
    const show = await fetchTMDB<TVShowDetails>(`/tv/${id}`);
    const pageTitle = show.name;
    const fullOgTitle = `${show.name} | Cineby`;
    const rawOverview = show.overview?.trim();
    const descText = rawOverview
      ? (rawOverview.length > 155 ? `${rawOverview.slice(0, 152)}...` : rawOverview)
      : `Discover where to stream ${show.name}, watch official trailers, episode guides, and seasons on Cineby.`;
    const poster = getImageUrl(show.poster_path, 'original');

    return {
      title: pageTitle,
      description: descText,
      alternates: {
        canonical: `/tv/${id}`,
      },
      openGraph: {
        title: fullOgTitle,
        description: descText,
        images: show.poster_path ? [{ url: poster, alt: show.name }] : [],
        type: 'video.tv_show',
        siteName: 'Cineby',
      },
      twitter: {
        card: 'summary_large_image',
        title: fullOgTitle,
        description: descText,
        images: show.poster_path ? [poster] : [],
      },
    };
  } catch {
    return { title: 'TV Show' };
  }
}

export default async function TVShowPage(props: { 
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;

  return <TVDetailContent slug={slug} searchParams={searchParams} isModal={false} />;
}
