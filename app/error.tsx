'use client';

import { useEffect } from 'react';
import { Icons } from '@/components/ui/icons';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-red-500/20 p-4 rounded-full">
            <Icons.alertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
        <p className="text-neutral-400 mb-8">
          We encountered an unexpected error while trying to load this content. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-neutral-200 transition-colors"
        >
          <Icons.refreshCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
