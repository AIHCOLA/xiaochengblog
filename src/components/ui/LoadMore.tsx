import { useEffect, useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import styles from './LoadMore.module.css';

interface LoadMoreProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function LoadMore({ loading, hasMore, onLoadMore }: LoadMoreProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, hasMore, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div ref={sentinelRef} className={styles.wrapper}>
      {loading && <LoadingSpinner size="sm" text="加载更多文章..." />}
    </div>
  );
}
