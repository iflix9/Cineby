import { TVDetailContent } from '@/components/features/tv-detail-content';
import { DetailModal } from '@/components/ui/detail-modal';

export default async function InterceptedTVPage(props: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;

  return (
    <DetailModal>
      <TVDetailContent slug={slug} searchParams={searchParams} isModal={true} />
    </DetailModal>
  );
}
