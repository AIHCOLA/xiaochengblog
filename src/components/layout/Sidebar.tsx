import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Tag as TagIcon, Bookmark } from 'lucide-react';
import { usePosts } from '../../context/PostsContext';
import { useAuth } from '../../context/AuthContext';
import { AuthorCard } from '../author/AuthorCard';
import { formatDateShort } from '../../utils/format';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { isLoggedIn } = useAuth();
  const { getRecentPosts, posts, allCategories, allTags } = usePosts();
  const recentPosts = getRecentPosts(5);

  // Dynamic category counts
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of posts) {
      counts[p.category.slug] = (counts[p.category.slug] || 0) + 1;
    }
    return counts;
  }, [posts]);

  return (
    <aside className={styles.sidebar}>
      {/* Author Card — only for logged-in users */}
      {isLoggedIn && (
        <div className={styles.widget}>
          <AuthorCard />
        </div>
      )}

      {/* Recent Posts */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>
          <Clock size={16} />
          近期文章
        </h3>
        <div className={styles.recentList}>
          {recentPosts.map((post) => (
            <Link key={post.id} to={`/article/${post.slug}`} className={styles.recentItem}>
              <span className={styles.recentTitle}>{post.title}</span>
              <span className={styles.recentDate}>{formatDateShort(post.createdAt)}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>
          <Bookmark size={16} />
          文章分类
        </h3>
        <div className={styles.catList}>
          {allCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className={styles.catItem}
              style={{ '--cat-color': cat.color } as React.CSSProperties}
            >
              <span className={styles.catDot} />
              <span className={styles.catName}>{cat.name}</span>
              <span className={styles.catCount}>
                {catCounts[cat.slug] || 0}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Tags Cloud */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>
          <TagIcon size={16} />
          标签云
        </h3>
        <div className={styles.tagCloud}>
          {allTags.slice(0, 15).map((tag) => (
            <Link key={tag.id} to={`/tag/${tag.slug}`} className={styles.tag}>
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
