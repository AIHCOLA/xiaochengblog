import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, ArrowRight } from 'lucide-react';
import styles from './SearchCard.module.css';

export function SearchCard() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const handleWebSearch = useCallback(() => {
    if (!query.trim()) return;
    window.open(`https://www.bing.com/search?q=${encodeURIComponent(query.trim())}`, '_blank');
    setQuery('');
  }, [query]);

  const handleSiteSearch = useCallback(() => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
  }, [query, navigate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleWebSearch();
      }
    },
    [handleWebSearch],
  );

  useEffect(() => {
    if (!focused) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(`.${styles.card}`)) return;
      setFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [focused]);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Search size={16} />
        Bing 搜索
      </h3>

      <div className={`${styles.inputWrap} ${focused ? styles.focused : ''}`}>
        <Search size={15} className={styles.inputIcon} />
        <input
          type="text"
          className={styles.input}
          placeholder="输入关键词搜索…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
        />
        {query.trim() && (
          <button className={styles.goBtn} onClick={handleWebSearch}>
            <Globe size={14} />
          </button>
        )}
      </div>

      {focused && query.trim() && (
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${styles.primaryAction}`} onClick={handleWebSearch}>
            <Globe size={14} />
            Bing 搜索
          </button>
          <button className={styles.actionBtn} onClick={handleSiteSearch}>
            <ArrowRight size={14} />
            站内
          </button>
        </div>
      )}
    </div>
  );
}
