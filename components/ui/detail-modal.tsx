'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

interface DetailModalProps {
  children: React.ReactNode;
}

export function DetailModal({ children }: DetailModalProps) {
  const router = useRouter();
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const handleClose = React.useCallback(() => {
    router.back();
  }, [router]);

  // Lock background body scroll with scrollbar compensation to prevent layout shifts
  React.useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] bg-black overflow-y-auto w-full min-h-screen animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="min-h-full w-full">
        {children}
      </div>
    </div>
  );
}
