'use client';

import { useEffect } from 'react';

interface DocumentTitleProps {
  title: string;
}

export function DocumentTitle({ title }: DocumentTitleProps) {
  useEffect(() => {
    if (typeof document !== 'undefined' && title) {
      document.title = title;
    }
  }, [title]);

  return null;
}
