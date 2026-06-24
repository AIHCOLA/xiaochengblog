import { ExternalLink, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthorCard.module.css';

export function AuthorCard() {
  const { user, isLoggedIn } = useAuth();

  const name = isLoggedIn && user ? user.username : '博客作者';
  const bio = isLoggedIn && user?.bio ? user.bio : '';
  const initials = isLoggedIn && user
    ? user.username.slice(0, 2).toUpperCase()
    : 'B';
  const avatarUrl = isLoggedIn ? user?.avatar : undefined;

  const links: [string, string, boolean][] = [];
  if (user?.email) {
    links.push(['邮箱', `mailto:${user.email}`, true]);
  }
  if (user?.socialLinks) {
    Object.entries(user.socialLinks).forEach(([name, url]) => {
      links.push([name, url, false]);
    });
  }

  return (
    <div className={styles.card}>
      <div className={styles.avatarWrapper}>
        <div className={styles.avatar}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} loading="lazy" referrerPolicy="no-referrer" className={styles.avatarImg} />
          ) : (
            <span className={styles.avatarText}>{initials}</span>
          )}
        </div>
        <div className={styles.statusDot} />
      </div>
      <h3 className={styles.name}>{name}</h3>
      {bio && <p className={styles.bio}>{bio}</p>}
      {links.length > 0 && (
        <div className={styles.links}>
          {links.map(([label, url, isEmail]) => (
            <a key={label} href={url} target={isEmail ? undefined : '_blank'} rel={isEmail ? undefined : 'noopener noreferrer'} className={styles.link}>
              {isEmail ? <Mail size={16} /> : <ExternalLink size={16} />}
              <span>{label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
