import { useState, useEffect, useCallback, useMemo } from 'react';
import { List } from 'lucide-react';
import { extractHeadings } from '../../utils/headings';
import styles from './TableOfContents.module.css';

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const items = useMemo(() => extractHeadings(content), [content]);
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Build intersection observer to track visible headings
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that's currently intersecting (visible)
        // Fall back to the last one above the viewport
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            return;
          }
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px', // top offset for sticky header
        threshold: 0,
      },
    );

    const elements = items
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [items]);

  // Scroll to heading on click
  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveId(id);
      setMobileOpen(false);
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <>
      {/* Mobile toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
      >
        <List size={16} />
        <span>目录</span>
        <span className={`${styles.mobileArrow} ${mobileOpen ? styles.mobileArrowOpen : ''}`}>
          ▾
        </span>
      </button>

      {/* TOC panel */}
      <nav
        className={`${styles.toc} ${mobileOpen ? styles.tocMobileOpen : ''}`}
        aria-label="文章目录"
      >
        <h4 className={styles.title}>目录</h4>
        <ul className={styles.list}>
          {items.map((item) => (
            <li
              key={item.id}
              className={`${styles.item} ${styles[`level${item.level}`]} ${
                activeId === item.id ? styles.active : ''
              }`}
            >
              <button
                className={styles.link}
                onClick={() => handleClick(item.id)}
                title={item.text}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
