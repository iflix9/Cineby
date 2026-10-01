import { notFound } from 'next/navigation';
import { isBlockedMedia } from '@/lib/tmdb';
import { MovieDetailContent } from '@/components/features/movie-detail-content';
import { DetailModal } from '@/components/ui/detail-modal';

export default async function InterceptedMoviePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  if (isBlockedMedia(id, 'movie')) {
    notFound();
  }

  return (
    <DetailModal>
      <MovieDetailContent id={id} searchParams={searchParams} isModal={true} />
    </DetailModal>
  );
}
