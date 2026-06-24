import { Layout } from '../components/layout/Layout';
import { ArticleCard } from '../components/article/ArticleCard';
import { PageLoading } from '../components/ui/PageLoading';
import { LoadMore } from '../components/ui/LoadMore';
import { EmptyState } from '../components/ui/EmptyState';
import { usePosts } from '../context/PostsContext';
import { Sparkles, FileText } from 'lucide-react';
import styles from './ArticlesPage.module.css';

export function ArticlesPage() {
  const { posts, getFeaturedPosts, loading, loadingMore, hasMore, loadMore } = usePosts();
  const featured = getFeaturedPosts();
  const regular = posts.filter((p) => !p.featured);
  const sorted = [...regular].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (loading) {
    return (
      <Layout>
        <div className={styles.page}>
          <PageLoading />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.page}>
        {/* Featured Section */}
        {featured.length > 0 && (
          <section className={styles.featuredSection}>
            <h2 className={styles.sectionTitle}>
              <Sparkles size={18} />
              精选文章
            </h2>
            <div className={styles.featuredGrid}>
              {featured.map((post) => (
                <ArticleCard key={post.id} post={post} variant="featured" />
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section className={styles.allSection}>
          <h2 className={styles.sectionTitle}>全部文章</h2>
          {sorted.length > 0 ? (
            <>
              <div className={styles.grid}>
                {sorted.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
              <LoadMore loading={loadingMore} hasMore={hasMore} onLoadMore={loadMore} />
            </>
          ) : (
            <EmptyState icon={<FileText size={40} />} title="暂无文章" />
          )}
        </section>
      </div>
    </Layout>
  );
}
