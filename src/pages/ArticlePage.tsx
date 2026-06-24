import { useParams, Link, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ArticleDetail } from '../components/article/ArticleDetail';
import { TableOfContents } from '../components/article/TableOfContents';
import { CommentSection } from '../components/interaction/CommentSection';
import { usePosts } from '../context/PostsContext';
import { useAuth } from '../context/AuthContext';
import { FileQuestion } from 'lucide-react';
import styles from './ArticlePage.module.css';

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug, loading } = usePosts();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (authLoading || loading) {
    return (
      <Layout>
        <div className={styles.notFound}>
          <p>加载中...</p>
        </div>
      </Layout>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!post) {
    return (
      <Layout>
        <div className={styles.notFound}>
          <FileQuestion size={48} className={styles.notFoundIcon} />
          <h2>文章未找到</h2>
          <p>你访问的文章可能已被删除或不存在。</p>
          <Link to="/" className={styles.backHome}>
            返回首页
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebar={false}>
      <div className={styles.articleLayout}>
        <div className={styles.articleMain}>
          <ArticleDetail post={post} />
          <CommentSection postId={post.id} />
        </div>
        <TableOfContents content={post.content} />
      </div>
    </Layout>
  );
}
