'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';

export function BackButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleBack = () => {
    const isPlay = searchParams?.get('play') === 'true';
    if (isPlay && pathname) {
      router.replace(pathname);
    } else if (pathname?.startsWith('/movie/') || pathname?.startsWith('/tv/')) {
      router.push('/');
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className="absolute top-6 left-6 md:top-10 md:left-12 z-50 w-11 h-11 rounded-full flex items-center justify-center bg-zinc-900/60 hover:bg-zinc-800/80 backdrop-blur-md border border-zinc-800/60 hover:border-red-500/50 text-zinc-300 hover:text-red-500 hover:scale-105 transition-all group/back shadow-lg"
    >
      <Icons.chevronLeft className="w-5 h-5 text-zinc-300 group-hover/back:text-red-500 transition-colors group-hover/back:-translate-x-0.5" />
    </button>
  );
}

