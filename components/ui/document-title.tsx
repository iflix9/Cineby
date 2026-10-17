'use client';

import { useEffect, useRef } from 'react';

interface DocumentTitleProps {
  title: string;
}

export function DocumentTitle({ title }: DocumentTitleProps) {
  const prevTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined' && title) {
      if (prevTitleRef.current === null) {
        prevTitleRef.current = document.title;
      }
      document.title = title;

      return () => {
        if (prevTitleRef.current) {
          document.title = prevTitleRef.current;
        }
      };
    }
  }, [title]);

  return null;
}
