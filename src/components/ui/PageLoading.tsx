import { LoadingSpinner } from './LoadingSpinner';
import styles from './PageLoading.module.css';

interface PageLoadingProps {
  text?: string;
}

export function PageLoading({ text = '加载中...' }: PageLoadingProps) {
  return (
    <div className={styles.wrapper}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}
