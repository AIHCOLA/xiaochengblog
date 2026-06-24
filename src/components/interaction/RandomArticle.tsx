import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, ArrowRight } from 'lucide-react';
import { usePosts } from '../../context/PostsContext';
import { formatDateShort } from '../../utils/format';
import type { Post } from '../../types';
import styles from './RandomArticle.module.css';

export function RandomArticle() {
  const { posts } = usePosts();

  if (posts.length === 0) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>
          <Shuffle size={16} />
          随机推荐
        </h3>
        <p className={styles.empty}>暂无文章</p>
      </div>
    );
  }

  const [article, setArticle] = useState<Post>(posts[0]);

  const shuffle = useCallback(() => {
    let next: Post;
    do {
      next = posts[Math.floor(Math.random() * posts.length)];
    } while (posts.length > 1 && next.id === article.id);
    setArticle(next);
  }, [article.id, posts]);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Shuffle size={16} />
        随机推荐
        <button className={styles.refreshBtn} onClick={shuffle} title="换一篇">
          <Shuffle size={13} />
        </button>
      </h3>
      <Link to={`/article/${article.slug}`} className={styles.content}>
        {article.coverImage && (
          <img src={article.coverImage} alt="" loading="lazy" className={styles.cover} />
        )}
        <div className={styles.info}>
          <span className={styles.articleTitle}>{article.title}</span>
          <span className={styles.meta}>
            {article.category.name} · {formatDateShort(article.createdAt)}
          </span>
        </div>
        <ArrowRight size={16} className={styles.arrow} />
      </Link>
    </div>
  );
}
