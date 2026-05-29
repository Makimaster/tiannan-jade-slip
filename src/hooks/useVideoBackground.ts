import { useEffect, useRef } from 'react';

/**
 * Hook to manage body background transparency and root element z-index
 * for pages with full-screen video backgrounds.
 * Three pages (HomePage, CharactersPage, TimelinePage) use this pattern.
 */
export function useVideoBackground() {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const root = document.getElementById('root');
    const prevBg = document.body.style.background;
    const prevPos = root?.style.position || '';
    const prevZ = root?.style.zIndex || '';

    document.body.style.background = 'transparent';
    if (root) {
      root.style.position = 'relative';
      root.style.zIndex = '1';
    }

    cleanupRef.current = () => {
      document.body.style.background = prevBg;
      if (root) {
        root.style.position = prevPos;
        root.style.zIndex = prevZ;
      }
    };

    return () => {
      cleanupRef.current?.();
    };
  }, []);
}
