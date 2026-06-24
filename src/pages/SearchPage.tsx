import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ArticleCard } from '../components/article/ArticleCard';
import { EmptyState } from '../components/ui/EmptyState';
import { usePosts } from '../context/PostsContext';
import { searchPosts } from '../utils/search';
import { Search, X, FileSearch } from 'lucide-react';
import type { Post } from '../types';
import styles from './SearchPage.module.css';

export function SearchPage() {
  const { posts } = usePosts();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<Post[]>([]);

  useEffect(() => {
    if (query.trim()) {
      setResults(searchPosts(posts, query));
    } else {
      setResults([]);
    }
    setInputValue(query);
  }, [query, posts]);

  const handleSearch = () => {
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSearchParams({});
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <Layout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <Search size={22} />
            搜索文章
          </h1>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.input}
              placeholder="搜索文章标题、内容..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {inputValue && (
              <button className={styles.clearBtn} onClick={handleClear}>
                <X size={16} />
              </button>
            )}
            <button className={styles.searchBtn} onClick={handleSearch}>
              搜索
            </button>
          </div>
        </header>

        <div className={styles.results}>
          {query ? (
            <>
              <p className={styles.resultCount}>
                找到 <strong>{results.length}</strong> 篇相关文章
              </p>
              {results.length > 0 ? (
                <div className={styles.grid}>
                  {results.map((post) => (
                    <ArticleCard key={post.id} post={post} highlight={query} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FileSearch size={40} />}
                  title={`未找到与 "${query}" 相关的文章`}
                  hint="试试其他关键词"
                />
              )}
            </>
          ) : (
            <div className={styles.prompt}>
              <Search size={48} className={styles.promptIcon} />
              <p>输入关键词开始搜索</p>
              <p className={styles.promptHint}>
                支持模糊搜索，可搜索标题、内容、分类和标签
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
