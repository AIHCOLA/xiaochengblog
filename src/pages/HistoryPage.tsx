import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useReadingHistory } from '../hooks/useReadingHistory';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatRelativeTime } from '../utils/format';
import { Clock, Trash2, BookOpen, ArrowRight, LogIn } from 'lucide-react';
import styles from './HistoryPage.module.css';

export function HistoryPage() {
  const { history, clearHistory, removeFromHistory } = useReadingHistory();
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className={styles.page}>
          <EmptyState
            icon={<LogIn size={48} />}
            title="请先登录"
            hint="登录后即可查看阅读历史"
            action={{ label: '去登录', to: '/login' }}
          />
        </div>
      </Layout>
    );
  }

  const handleClear = () => {
    clearHistory();
    addToast('info', '阅读历史已清空');
  };

  return (
    <Layout>
      <div className={styles.page}>
        <PageHeader
          icon={<Clock size={22} />}
          title="阅读历史"
          stats={[{ label: '记录', value: history.length }]}
        />
        {history.length > 0 && (
          <div className={styles.toolbar}>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 size={14} />
              清空历史
            </Button>
          </div>
        )}

        {history.length > 0 ? (
          <div className={styles.list}>
            {history.map((entry) => (
              <div key={entry.postId} className={styles.item}>
                <div className={styles.itemIcon}>
                  <BookOpen size={16} />
                </div>
                <div className={styles.itemInfo}>
                  <Link
                    to={`/article/${entry.postSlug}`}
                    className={styles.itemTitle}
                  >
                    {entry.postTitle}
                  </Link>
                  <span className={styles.itemTime}>
                    阅读于 {formatRelativeTime(entry.readAt)}
                  </span>
                </div>
                <div className={styles.itemActions}>
                  <Link
                    to={`/article/${entry.postSlug}`}
                    className={styles.readLink}
                  >
                    <ArrowRight size={16} />
                  </Link>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromHistory(entry.postId)}
                    aria-label="移除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen size={48} />}
            title="暂无阅读记录"
            hint="开始阅读文章，你的阅读历史会显示在这里"
            action={{ label: '浏览文章', to: '/' }}
          />
        )}
      </div>
    </Layout>
  );
}
