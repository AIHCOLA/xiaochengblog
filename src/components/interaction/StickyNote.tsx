import { useState, useCallback, useEffect, useRef } from 'react';
import { StickyNote as NoteIcon, Palette, Eye, Pencil, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../context/AuthContext';
import * as stickyApi from '../../api/stickyNote';
import styles from './StickyNote.module.css';

const STRIP_COLORS = ['#6c5ce7', '#f59e0b', '#ec4899', '#22c55e', '#3b82f6', '#f97316'];

export function StickyNote() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(true);
  const [colorIdx, setColorIdx] = useState(0);
  const [preview, setPreview] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const accentColor = STRIP_COLORS[colorIdx % STRIP_COLORS.length];

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    stickyApi.get()
      .then((data) => {
        setText(data.content || '');
        setColorIdx(data.colorIndex || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, authLoading]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isLoggedIn) {
        stickyApi.save({ content: value }).catch(() => {});
      }
      setSaved(true);
    }, 500);
  }, [isLoggedIn]);

  const cycleColor = useCallback(() => {
    setColorIdx((prev) => {
      const next = (prev + 1) % STRIP_COLORS.length;
      if (isLoggedIn) {
        stickyApi.save({ colorIndex: next }).catch(() => {});
      }
      return next;
    });
  }, [isLoggedIn]);

  if (authLoading || loading) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>
          <NoteIcon size={16} />
          便利贴
        </h3>
        <Loader2 size={16} className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <NoteIcon size={16} />
        便利贴
        {saved && <span className={styles.saved}>已保存</span>}
        {isLoggedIn && (
          <>
            <button
              className={`${styles.modeBtn} ${preview ? styles.modeActive : ''}`}
              onClick={() => setPreview((v) => !v)}
              title={preview ? '编辑' : '预览'}
            >
              {preview ? <Pencil size={13} /> : <Eye size={13} />}
            </button>
            <button className={styles.colorBtn} onClick={cycleColor} title="切换颜色">
              <Palette size={14} />
            </button>
          </>
        )}
      </h3>

      <div className={styles.noteBody}>
        <div className={styles.adhesive} style={{ '--strip-color': accentColor } as React.CSSProperties} />
        {preview ? (
          <div className={styles.preview}>
            {text.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {text}
              </ReactMarkdown>
            ) : (
              <span className={styles.emptyPreview}>空内容，切换到编辑模式写点什么</span>
            )}
          </div>
        ) : (
          <textarea
            className={styles.textarea}
            placeholder="写点东西… 支持 Markdown"
            value={text}
            onChange={handleChange}
          />
        )}
        <div className={styles.footer}>
          <span className={styles.charCount}>{text.length}</span>
        </div>
      </div>
    </div>
  );
}
