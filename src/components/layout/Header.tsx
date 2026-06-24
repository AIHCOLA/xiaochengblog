import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, LogOut, Sun, Moon, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import styles from './Header.module.css';

const navLinks = [
  { to: '/', label: '首页' },
  { to: '/articles', label: '文章' },
  { to: '/archive', label: '归档' },
  { to: '/guestbook', label: '留言板' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollY = useScrollPosition();
  const scrolled = scrollY > 10;
  const location = useLocation();
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <div className={styles.logoWrap}>
          <Link to={user?.link || '/'} className={styles.logo} target={user?.link ? '_blank' : undefined} rel={user?.link ? 'noopener noreferrer' : undefined}>
            {user?.avatar ? (
              <img src={user.avatar} alt="" loading="lazy" referrerPolicy="no-referrer" className={styles.logoAvatar} />
            ) : (
              <span className={styles.logoIcon}>{'<'}</span>
            )}
            <span className={styles.logoText}>{user?.username || 'My Blog'}</span>
            {!user?.avatar && <span className={styles.logoIcon}>{'/>'}</span>}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.navLink} ${location.pathname === link.to ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={toggleTheme} aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'} title={isDark ? '亮色模式' : '暗色模式'}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link to="/search" className={styles.iconBtn} aria-label="搜索">
            <Search size={18} />
          </Link>

          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link to="/publish" className={styles.iconBtn} aria-label="发布文章" title="发布文章">
                  <Edit3 size={18} />
                </Link>
              )}
              <Link to="/profile" className={styles.iconBtn} aria-label="个人中心">
                <User size={18} />
              </Link>
              <button className={styles.iconBtn} onClick={logout} aria-label="退出">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.loginBtn}>
              登录
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay — rendered via portal to escape header stacking context */}
      {menuOpen &&
        createPortal(
          <div className={styles.mobileMenu} onClick={() => setMenuOpen(false)}>
            <nav className={styles.mobileNav} onClick={(e) => e.stopPropagation()}>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`${styles.mobileNavLink} ${
                    location.pathname === link.to ? styles.active : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className={styles.divider} />
              <button className={styles.mobileNavLink} onClick={toggleTheme}>
                {isDark ? '☀️ 切换到亮色模式' : '🌙 切换到暗色模式'}
              </button>
              <hr className={styles.divider} />
              {isLoggedIn ? (
                <>
                  <div className={styles.mobileUser}>
                    <span className={styles.mobileUserName}>{user?.username}</span>
                  </div>
                  {isAdmin && (
                    <Link to="/publish" className={styles.mobileNavLink}>
                      ✍️ 发布文章
                    </Link>
                  )}
                  <Link to="/profile" className={styles.mobileNavLink}>
                    个人中心
                  </Link>
                  <Link to="/history" className={styles.mobileNavLink}>
                    阅读历史
                  </Link>
                  <button className={styles.mobileNavLink} onClick={logout}>
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={styles.mobileNavLink}>
                    登录
                  </Link>
                  <Link to="/register" className={styles.mobileNavLink}>
                    注册
                  </Link>
                </>
              )}
            </nav>
          </div>,
          document.body
        )}
    </header>
  );
}
