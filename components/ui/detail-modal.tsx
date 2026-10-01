'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/icons';

interface DetailModalProps {
  children: React.ReactNode;
}

export function DetailModal({ children }: DetailModalProps) {
  const router = useRouter();
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const handleClose = React.useCallback(() => {
    router.back();
  }, [router]);

  // Lock background body scroll when modal is open
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose]);

  // Handle click on backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md overflow-y-auto custom-scrollbar animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Floating Close Button Top Right */}
      <button
        type="button"
        onClick={handleClose}
        className="fixed top-4 sm:top-6 right-4 sm:right-6 md:right-10 z-[70] w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_6px_rgba(0,0,0,0.4)] hover:ring-red-500/50 hover:from-zinc-800 hover:to-zinc-900 text-zinc-300 hover:text-red-500 transition-all duration-200 active:scale-95 group/close cursor-pointer"
        aria-label="Close modal"
      >
        <Icons.x className="w-5 h-5 text-zinc-300 group-hover/close:text-red-500 transition-colors group-hover/close:rotate-90 duration-200" />
      </button>

      {/* Modal Content */}
      <div className="min-h-full w-full">
        {children}
      </div>
    </div>
  );
}
