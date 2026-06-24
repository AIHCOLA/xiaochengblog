import { useState, useCallback, type ReactElement } from 'react';
import { Check, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { languageDisplayName } from '../../utils/headings';
import styles from './CodeBlock.module.css';

interface CodeBlockProps {
  language: string;
  code: string;
  children: ReactElement; // the rendered <code> from react-markdown
}

export function CodeBlock({ language, code, children }: CodeBlockProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // clipboard API may fail in insecure contexts (e.g. http://localhost)
      // fall through silently — the button simply won't copy
    });
  }, [code]);

  const displayLang = languageDisplayName(language || 'text');

  return (
    <div className={`${styles.codeBlock} ${collapsed ? styles.collapsed : ''}`}>
      {/* Header bar */}
      <div className={styles.header}>
        <button
          className={styles.toggle}
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? '展开代码' : '折叠代码'}
          title={collapsed ? '展开' : '折叠'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
        <span className={styles.lang}>{displayLang}</span>
        <button
          className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          aria-label="复制代码"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>已复制</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>复制</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className={styles.body} aria-hidden={collapsed}>
        {children}
      </div>
    </div>
  );
}
