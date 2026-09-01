'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/movie') || pathname?.startsWith('/tv') || pathname?.startsWith('/person')) {
    return null;
  }

  return (
    <footer className="w-full pb-8 md:pb-12 pt-8 md:pt-10 bg-black">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 mx-auto">
        <h2 className="text-xl font-bold text-white mb-3">Cineby</h2>
        <p className="text-xs sm:text-sm md:text-base text-neutral-400 mb-3 max-w-none lg:max-w-4xl">
          Cineby is a metadata search engine powered by TMDB. We do not host, store, or provide any media files.
        </p>
        <div className="mt-4">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/50 hover:bg-neutral-800 text-sm font-medium text-neutral-400 hover:text-white transition-all border border-neutral-800/50 hover:border-neutral-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
