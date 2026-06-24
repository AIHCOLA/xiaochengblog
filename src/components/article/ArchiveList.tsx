import { Link } from 'react-router-dom';
import type { Post } from '../../types';
import { formatDate } from '../../utils/format';
import { getArchiveGroups } from '../../utils/format';
import { Calendar } from 'lucide-react';
import styles from './ArchiveList.module.css';

interface ArchiveListProps {
  posts: Post[];
}

export function ArchiveList({ posts }: ArchiveListProps) {
  const groups = getArchiveGroups(posts);

  return (
    <div className={styles.archive}>
      {Array.from(groups.entries()).map(([year, months]) => (
        <div key={year} className={styles.yearGroup}>
          <h2 className={styles.year}>{year}</h2>
          <div className={styles.months}>
            {months.map(({ month, count }) => (
              <div key={month} className={styles.monthGroup}>
                <h3 className={styles.month}>
                  <Calendar size={14} />
                  {month}
                  <span className={styles.count}>{count} 篇</span>
                </h3>
                <div className={styles.posts}>
                  {posts
                    .filter((p) => {
                      const d = new Date(p.createdAt);
                      return `${d.getFullYear()}年${d.getMonth() + 1}月` === month;
                    })
                    .map((post) => (
                      <Link
                        key={post.id}
                        to={`/article/${post.slug}`}
                        className={styles.postItem}
                      >
                        <span className={styles.postDate}>
                          {formatDate(post.createdAt)}
                        </span>
                        <span className={styles.postTitle}>{post.title}</span>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
