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
      className="absolute top-4 sm:top-6 left-4 sm:left-6 md:left-10 lg:left-[max(3rem,calc((100vw-1440px)/2+48px))] z-50 w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_6px_rgba(0,0,0,0.4)] hover:ring-red-500/50 hover:from-zinc-800 hover:to-zinc-900 text-zinc-300 hover:text-red-500 transition-all duration-200 active:scale-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] group/back"
    >
      <Icons.chevronLeft className="w-5 h-5 text-zinc-300 group-hover/back:text-red-500 transition-colors group-hover/back:-translate-x-0.5" />
    </button>
  );
}

