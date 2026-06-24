import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { ArticleCard } from '../components/article/ArticleCard';
import { BookOpen, MessageSquare, FolderOpen, ArrowRight, LogIn, UserPlus, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as guestbookApi from '../api/guestbook';
import styles from './HomePage.module.css';

function WelcomePage() {
  const { allCategories, posts } = usePosts();
  const [guestbookCount, setGuestbookCount] = useState(0);

  useEffect(() => {
    guestbookApi.getEntries().then((entries) => setGuestbookCount(entries.length)).catch(() => {});
  }, []);

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const stats = [
    { icon: BookOpen, value: posts.length, label: '篇文章' },
    { icon: FolderOpen, value: allCategories.length, label: '个分类' },
    { icon: MessageSquare, value: guestbookCount, label: '条留言' },
  ];

  return (
    <div className={styles.welcome}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Xiao Cheng&apos;s Blog</div>
        <h1 className={styles.heroTitle}>
          写代码，思考架构
          <br />
          偶尔写写文章
        </h1>
        <p className={styles.heroDesc}>
          全栈工程师的技术博客 — 专注于 Web 技术与分布式系统
        </p>
        <div className={styles.heroActions}>
          <Link to="/articles" className={styles.heroPrimary}>
            <BookOpen size={18} />
            浏览文章
            <ChevronRight size={16} className={styles.heroArrow} />
          </Link>
          <Link to="/guestbook" className={styles.heroSecondary}>
            <MessageSquare size={18} />
            留言板
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsRow}>
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className={styles.statItem}>
            <Icon size={22} className={styles.statIcon} />
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </section>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h2 className={styles.recentTitle}>最新文章</h2>
            <Link to="/articles" className={styles.recentMore}>
              查看全部 <ArrowRight size={14} />
            </Link>
          </div>
          <div className={styles.recentGrid}>
            {recentPosts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Login prompt */}
      <section className={styles.loginSection}>
        <div className={styles.loginCard}>
          <h3 className={styles.loginTitle}>欢迎来访</h3>
          <p className={styles.loginDesc}>
            登录后可使用更多功能：收藏文章、发布留言、阅读历史等
          </p>
          <div className={styles.loginActions}>
            <Link to="/login" className={styles.loginBtn}>
              <LogIn size={16} />
              登录
            </Link>
            <Link to="/register" className={styles.registerBtn}>
              <UserPlus size={16} />
              注册
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function HomePage() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <Layout sidebar={false}>
        <WelcomePage />
      </Layout>
    );
  }

  return (
    <Layout sidebar={false}>
      <div className={styles.page}>
        <DashboardGrid />
      </div>
    </Layout>
  );
}
