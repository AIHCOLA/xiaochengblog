import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ArticleCard } from '../components/article/ArticleCard';
import { PageLoading } from '../components/ui/PageLoading';
import { PageHeader } from '../components/ui/PageHeader';
import { LoadMore } from '../components/ui/LoadMore';
import { EmptyState } from '../components/ui/EmptyState';
import { usePosts } from '../context/PostsContext';
import { Tag, Tags } from 'lucide-react';
import styles from './TagPage.module.css';

export function TagPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getPostsByTag, allTags, loading, loadingMore, hasMore, loadMore } = usePosts();
  const tag = slug ? allTags.find((t) => t.slug === slug) : undefined;
  const posts = slug ? getPostsByTag(slug) : [];

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
        {tag ? (
          <>
            <PageHeader
              icon={<Tag size={22} />}
              title={`标签：${tag.name}`}
              stats={[{ label: '文章', value: posts.length }]}
            />
            <div className={styles.grid}>
              {posts.length > 0 ? (
                posts.map((post) => <ArticleCard key={post.id} post={post} />)
              ) : (
                <EmptyState icon={<Tags size={40} />} title="该标签下暂无文章" />
              )}
            </div>
            {posts.length > 0 && (
              <LoadMore loading={loadingMore} hasMore={hasMore} onLoadMore={loadMore} />
            )}
          </>
        ) : (
          <div className={styles.notFound}>
            <h2>标签未找到</h2>
          </div>
        )}
      </div>
    </Layout>
  );
}
