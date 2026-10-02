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
      {/* Modal Content */}
      <div className="min-h-full w-full">
        {children}
      </div>
    </div>
  );
}
