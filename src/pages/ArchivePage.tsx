import { Layout } from '../components/layout/Layout';
import { ArchiveList } from '../components/article/ArchiveList';
import { PageLoading } from '../components/ui/PageLoading';
import { PageHeader } from '../components/ui/PageHeader';
import { usePosts } from '../context/PostsContext';
import { Archive } from 'lucide-react';
import styles from './ArchivePage.module.css';

export function ArchivePage() {
  const { posts, loading } = usePosts();

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
        <PageHeader
          icon={<Archive size={22} />}
          title="文章归档"
          stats={[{ label: '文章', value: posts.length }]}
        />
        <ArchiveList posts={posts} />
      </div>
    </Layout>
  );
}
