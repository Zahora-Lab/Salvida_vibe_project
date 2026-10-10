import { useSyncExternalStore } from 'react';

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * Use it when a breakpoint must change which component tree is rendered
 * (CSS alone would keep both mounted, e.g. two Leaflet maps).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', notify);
      return () => mediaQuery.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
  );
}
