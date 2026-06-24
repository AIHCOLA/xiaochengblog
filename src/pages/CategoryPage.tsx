import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ArticleCard } from '../components/article/ArticleCard';
import { PageLoading } from '../components/ui/PageLoading';
import { PageHeader } from '../components/ui/PageHeader';
import { LoadMore } from '../components/ui/LoadMore';
import { EmptyState } from '../components/ui/EmptyState';
import { usePosts } from '../context/PostsContext';
import { FolderOpen, Files } from 'lucide-react';
import styles from './CategoryPage.module.css';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getPostsByCategory, allCategories, loading, loadingMore, hasMore, loadMore } = usePosts();
  const category = slug ? allCategories.find((c) => c.slug === slug) : undefined;
  const posts = slug ? getPostsByCategory(slug) : [];

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
        {category ? (
          <>
            <PageHeader
              icon={<FolderOpen size={22} style={{ color: category.color }} />}
              title={category.name}
              subtitle={category.description}
              stats={[{ label: '文章', value: posts.length }]}
            />
            <div className={styles.grid}>
              {posts.length > 0 ? (
                posts.map((post) => <ArticleCard key={post.id} post={post} />)
              ) : (
                <EmptyState icon={<Files size={40} />} title="该分类下暂无文章" />
              )}
            </div>
            {posts.length > 0 && (
              <LoadMore loading={loadingMore} hasMore={hasMore} onLoadMore={loadMore} />
            )}
          </>
        ) : (
          <div className={styles.notFound}>
            <h2>分类未找到</h2>
          </div>
        )}
      </div>
    </Layout>
  );
}
