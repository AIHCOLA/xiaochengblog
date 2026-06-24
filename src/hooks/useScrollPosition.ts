import { useState, useEffect } from 'react';

// Module-level shared listener — only ONE scroll listener ever, no matter
// how many components call useScrollPosition().
let subscriberCount = 0;
const subscribers = new Set<(y: number) => void>();

function sharedScrollHandler() {
  const y = window.scrollY;
  subscribers.forEach((cb) => cb(y));
}

export function useScrollPosition(): number {
  const [scrollY, setScrollY] = useState(window.scrollY);

  useEffect(() => {
    const cb = (y: number) => setScrollY(y);
    subscribers.add(cb);
    subscriberCount++;

    if (subscriberCount === 1) {
      window.addEventListener('scroll', sharedScrollHandler, { passive: true });
    }

    return () => {
      subscribers.delete(cb);
      subscriberCount--;
      if (subscriberCount === 0) {
        window.removeEventListener('scroll', sharedScrollHandler);
      }
    };
  }, []);

  return scrollY;
}
