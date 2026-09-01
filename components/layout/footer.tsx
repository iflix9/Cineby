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
        <p className="text-sm md:text-base text-neutral-400 mb-3">
          This site does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
        </p>
        <div className="mt-4">
          <Link
            href="/legal"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/50 hover:bg-neutral-800 text-sm font-medium text-neutral-400 hover:text-white transition-all border border-neutral-800/50 hover:border-neutral-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            </svg>
            Legal / DMCA
          </Link>
        </div>
      </div>
    </footer>
  );
}
