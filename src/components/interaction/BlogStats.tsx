import { FileText, Bookmark, Tag as TagIcon, BarChart3 } from 'lucide-react';
import { usePosts } from '../../context/PostsContext';
import styles from './BlogStats.module.css';

export function BlogStats() {
  const { posts, allCategories, allTags } = usePosts();

  const stats = [
    { icon: FileText, label: '文章', value: posts.length, color: 'purple' as const },
    { icon: Bookmark, label: '分类', value: allCategories.length, color: 'green' as const },
    { icon: TagIcon, label: '标签', value: allTags.length, color: 'amber' as const },
  ];

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <BarChart3 size={16} />
        数据统计
      </h3>
      <div className={styles.grid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.item}>
            <div className={`${styles.iconWrap} ${styles[`iconWrap${s.color[0].toUpperCase() + s.color.slice(1)}`]}`}>
              <s.icon size={18} />
            </div>
            <span className={styles.value}>{s.value}</span>
            <span className={styles.label}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
