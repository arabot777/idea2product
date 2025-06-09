'use client';

import { useEffect } from 'react';

export function FontLoader({ className }: { className: string }) {
  useEffect(() => {
    document.documentElement.classList.add(className);
    return () => {
      document.documentElement.classList.remove(className);
    };
  }, [className]);

  return null;
}
