'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';
import { BrowseDropdown } from './browse-dropdown';
import { SearchBar } from '@/components/features/search-bar';
import { SettingsModal } from '@/components/features/settings-modal';

export function Navbar() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const isDetailsPage = pathname?.startsWith('/movie/') || pathname?.startsWith('/tv/');
  if (isDetailsPage) {
    return null;
  }

  return (
    <>
      <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-12 max-w-[1440px] h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 relative z-10 group">
            <picture>
              <img src="/logo.png" alt="Cineby" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-[1.06]" />
            </picture>
            <span className="text-xl md:text-2xl font-bold text-white">Cineby</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 md:space-x-8 text-base font-semibold">
             <Link href="/" className="group text-zinc-300 hover:text-red-500 hover:bg-zinc-800/50 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2">
               <Icons.home className="w-5 h-5 transition-colors duration-200" />
               <span className="hidden sm:inline transition-colors duration-200">Home</span>
             </Link>
             <a href={process.env.NEXT_PUBLIC_API_LINK || "/"} target={process.env.NEXT_PUBLIC_API_LINK ? "_blank" : undefined} rel="noopener noreferrer" className="group text-zinc-300 hover:text-red-500 hover:bg-zinc-800/50 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2">
               <Icons.code className="w-5 h-5 transition-colors duration-200" />
               <span className="hidden sm:inline transition-colors duration-200">API</span>
             </a>
             <BrowseDropdown />
             <SearchBar />
             <button onClick={() => setIsSettingsOpen(true)} className="group text-zinc-300 hover:text-red-500 hover:bg-zinc-800/50 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center" title="Settings" aria-label="Settings">
               <Icons.settings className="w-5 h-5 transition-colors duration-200" strokeWidth={2.2} />
             </button>
          </nav>
        </div>
      </header>
      
      {/* Mobile Floating Bottom Navigation Dock (Icon Only) */}
      <nav 
        className="md:hidden fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 h-[54px] bg-[#121214]/85 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-1.5 flex items-center justify-center gap-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.12),_0_0_0_1px_rgba(0,0,0,0.6)] select-none"
        aria-label="Mobile navigation"
      >
        <Link 
          href="/" 
          className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 active:scale-90 ${
            pathname === '/' 
              ? 'text-red-500 bg-red-500/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title="Home"
          aria-label="Home"
        >
          <Icons.home className="w-5 h-5 transition-colors" />
          {pathname === '/' && <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-red-500" />}
        </Link>

        <a 
          href={process.env.NEXT_PUBLIC_API_LINK || "/"} 
          target={process.env.NEXT_PUBLIC_API_LINK ? "_blank" : undefined} 
          rel="noopener noreferrer" 
          className="relative flex items-center justify-center w-11 h-11 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-90"
          title="API"
          aria-label="API"
        >
          <Icons.code className="w-5 h-5 transition-colors" />
        </a>

        <BrowseDropdown isMobile={true} />

        <SearchBar isMobile={true} />

        <button 
          onClick={() => setIsSettingsOpen(true)} 
          className="relative flex items-center justify-center w-11 h-11 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-90" 
          title="Settings" 
          aria-label="Settings"
        >
          <Icons.settings className="w-5 h-5 transition-colors" strokeWidth={2.2} />
        </button>
      </nav>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
