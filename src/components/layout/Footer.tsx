import { Link } from 'react-router-dom';
import { Globe, AtSign, Mail, Rss, Code2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { usePosts } from '../../context/PostsContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Footer.module.css';

const SOCIAL_ICONS: Record<string, ReactElement> = {
  github: <Code2 size={18} />,
  twitter: <AtSign size={18} />,
  email: <Mail size={18} />,
  website: <Globe size={18} />,
};

function getSocialIcon(key: string): ReactElement {
  const lower = key.toLowerCase();
  for (const [platform, icon] of Object.entries(SOCIAL_ICONS)) {
    if (lower.includes(platform)) return icon;
  }
  return <Globe size={18} />;
}

export function Footer() {
  const { allCategories } = usePosts();
  const { user, isLoggedIn } = useAuth();

  const brandName = isLoggedIn && user ? user.username : 'My Blog';
  const descriptionLines = isLoggedIn && user?.bio
    ? [user.bio]
    : ['写代码，思考架构，偶尔写写文章。', '专注于 Web 技术与分布式系统。'];

  const socialLinks: { key: string; url: string; label: string }[] = [];
  if (user?.socialLinks) {
    for (const [key, url] of Object.entries(user.socialLinks)) {
      if (url) socialLinks.push({ key, url, label: key });
    }
  }
  if (user?.email) {
    socialLinks.push({ key: 'email', url: `mailto:${user.email}`, label: 'Email' });
  }
  if (user?.link) {
    socialLinks.push({ key: 'website', url: user.link, label: 'Website' });
  }

  // Fallback social icons when not logged in
  const showFallback = socialLinks.length === 0;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoAccent}>{'<'}</span>
              {brandName}
              <span className={styles.logoAccent}>{'/>'}</span>
            </Link>
            <p className={styles.desc}>
              {descriptionLines.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
            <div className={styles.social}>
              {showFallback ? (
                <>
                  <a href="#" className={styles.socialLink} aria-label="RSS">
                    <Rss size={18} />
                  </a>
                  <a href="#" className={styles.socialLink} aria-label="Email">
                    <Mail size={18} />
                  </a>
                </>
              ) : (
                socialLinks.map(({ key, url, label }) => (
                  <a
                    key={key}
                    href={url}
                    className={styles.socialLink}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getSocialIcon(key)}
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Links */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>导航</h4>
            <Link to="/" className={styles.link}>首页</Link>
            <Link to="/archive" className={styles.link}>文章归档</Link>
            <Link to="/guestbook" className={styles.link}>留言板</Link>
            <Link to="/search" className={styles.link}>搜索</Link>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>分类</h4>
            {allCategories.slice(0, 5).map((cat) => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className={styles.link}>{cat.name}</Link>
            ))}
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>其他</h4>
            {isLoggedIn ? (
              <>
                <Link to="/profile" className={styles.link}>个人中心</Link>
                <Link to="/archive" className={styles.link}>RSS 订阅</Link>
                <Link to="/guestbook" className={styles.link}>友情链接</Link>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.link}>登录</Link>
                <Link to="/archive" className={styles.link}>RSS 订阅</Link>
                <Link to="/guestbook" className={styles.link}>友情链接</Link>
              </>
            )}
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {brandName}. Built with React & TypeScript.
          </p>
        </div>
      </div>
    </footer>
  );
}
