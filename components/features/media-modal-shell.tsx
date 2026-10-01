'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';

interface MediaModalShellProps {
  children: React.ReactNode;
  fullPageUrl: string;
}

export function MediaModalShell({ children, fullPageUrl }: MediaModalShellProps) {
  const router = useRouter();
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const onDismiss = React.useCallback(() => {
    router.back();
  }, [router]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDismiss]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onDismiss();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-4xl bg-[#0f0f11] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top Controls */}
        <div className="absolute top-3.5 right-3.5 z-40 flex items-center gap-2">
          {/* Full Page Button */}
          <Link
            href={fullPageUrl}
            title="Open Full Details Page"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white flex items-center justify-center transition-all border border-white/10 shadow-lg backdrop-blur-sm group"
          >
            <Icons.externalLink className="w-4 h-4 transition-transform group-hover:scale-110" />
          </Link>

          {/* Close Modal button */}
          <button
            type="button"
            onClick={onDismiss}
            title="Close (Esc)"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white flex items-center justify-center transition-all border border-white/10 shadow-lg backdrop-blur-sm cursor-pointer group"
          >
            <Icons.x className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
