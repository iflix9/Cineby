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
  
  const isDetailsPage = pathname?.startsWith('/movie/') || pathname?.startsWith('/tv/') || pathname?.startsWith('/person/');
  if (isDetailsPage) {
    return null;
  }

  return (
    <>
      <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 h-20 flex items-center justify-between">
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
             <a href="https://discord.gg/eWa72k3NUH" target="_blank" rel="noopener noreferrer" className="group text-zinc-300 hover:text-red-500 hover:bg-zinc-800/50 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2">
               <Icons.code className="w-5 h-5 transition-colors duration-200" />
               <span className="hidden sm:inline transition-colors duration-200">API</span>
             </a>
             <BrowseDropdown />
             <SearchBar />
             <button onClick={() => setIsSettingsOpen(true)} className="group text-zinc-300 hover:text-red-500 hover:bg-zinc-800/50 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center">
               <Icons.user className="w-5 h-5 transition-colors duration-200" strokeWidth={2.5} />
             </button>
          </nav>
        </div>
      </header>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#161616]/95 backdrop-blur-xl border border-zinc-800/80 rounded-[20px] p-1.5 px-2.5 flex items-center justify-between w-max gap-1 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        <Link href="/" className={`relative flex flex-col items-center justify-center w-12 h-11 bg-[#050505] rounded-xl transition-colors duration-200 shadow-sm ${pathname === '/' ? 'text-[#ff3333]' : 'text-zinc-300 hover:text-white'}`}>
          <Icons.home className={`w-5 h-5 ${pathname === '/' ? 'mb-1' : ''}`} />
          {pathname === '/' && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#ff3333]"></span>}
        </Link>
        <a href="https://discord.gg/eWa72k3NUH" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center w-12 h-11 bg-[#050505] rounded-xl text-zinc-300 hover:text-white transition-colors duration-200 shadow-sm">
          <Icons.code className="w-5 h-5" />
        </a>
        <BrowseDropdown isMobile={true} />
        <SearchBar isMobile={true} />
        <button onClick={() => setIsSettingsOpen(true)} className="flex flex-col items-center justify-center w-12 h-11 bg-[#050505] rounded-xl text-zinc-300 hover:text-white transition-colors duration-200 shadow-sm">
           <Icons.logIn className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </nav>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
