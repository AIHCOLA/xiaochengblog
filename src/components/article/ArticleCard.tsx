import { Link } from 'react-router-dom';
import { Clock, Eye, Heart, ArrowRight } from 'lucide-react';
import type { Post } from '../../types';
import { formatDate } from '../../utils/format';
import { highlightMatch } from '../../utils/search';
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
  post: Post;
  variant?: 'default' | 'featured';
  highlight?: string;
}

function Highlighted({ text, query }: { text: string; query?: string }) {
  if (!query) return <>{text}</>;
  const segments = highlightMatch(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted ? <mark key={i}>{seg.text}</mark> : seg.text
      )}
    </>
  );
}

export function ArticleCard({ post, variant = 'default', highlight }: ArticleCardProps) {
  if (variant === 'featured') {
    return (
      <Link to={`/article/${post.slug}`} className={styles.featured}>
        <div className={styles.featuredContent}>
          <div className={styles.featuredMeta}>
            <span
              className={styles.category}
              style={{ '--cat-color': post.category.color } as React.CSSProperties}
            >
              {post.category.name}
            </span>
            {post.featured && <span className={styles.featuredBadge}>精选</span>}
          </div>
          <h2 className={styles.featuredTitle}>
            <Highlighted text={post.title} query={highlight} />
          </h2>
          <p className={styles.featuredExcerpt}>
            <Highlighted text={post.excerpt} query={highlight} />
          </p>
          <div className={styles.featuredFooter}>
            <span className={styles.metaItem}><Clock size={14} />{post.readingTime} 分钟</span>
            <span className={styles.metaItem}><Eye size={14} />{post.views.toLocaleString()}</span>
            <span className={styles.metaItem}><Heart size={14} />{post.likes}</span>
            <span className={styles.date}>{formatDate(post.createdAt)}</span>
          </div>
          <span className={styles.readMore}>
            阅读全文 <ArrowRight size={14} />
          </span>
        </div>
        <div className={styles.featuredGlow} />
      </Link>
    );
  }

  return (
    <article className={styles.card}>
      <Link to={`/article/${post.slug}`} className={styles.cardLink}>
        {post.coverImage && (
          <div className={styles.coverWrap}>
            <img src={post.coverImage} alt="" className={styles.coverImg} loading="lazy" />
          </div>
        )}
        <div className={styles.cardHeader}>
          <span
            className={styles.category}
            style={{ '--cat-color': post.category.color } as React.CSSProperties}
          >
            {post.category.name}
          </span>
          <span className={styles.readingTime}>
            <Clock size={12} />
            {post.readingTime} min
          </span>
        </div>
        <h3 className={styles.cardTitle}>
          <Highlighted text={post.title} query={highlight} />
        </h3>
        <p className={styles.cardExcerpt}>
          <Highlighted text={post.excerpt} query={highlight} />
        </p>
        <div className={styles.cardFooter}>
          <span className={styles.date}>{formatDate(post.createdAt)}</span>
          <span className={styles.stats}>
            <Eye size={13} />
            {post.views.toLocaleString()}
            <span className={styles.statSep} />
            <Heart size={13} />
            {post.likes}
          </span>
        </div>
        <div className={styles.cardTags}>
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag.id} className={styles.tag}>
              {tag.name}
            </span>
          ))}
        </div>
      </Link>
    </article>
  );
}
