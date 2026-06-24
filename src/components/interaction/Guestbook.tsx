import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Trash2, User, LogIn, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { GuestbookEntry } from '../../types';
import { formatRelativeTime } from '../../utils/format';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import * as guestbookApi from '../../api/guestbook';
import styles from './Guestbook.module.css';

const MAX_LENGTH = 500;
const DANMAKU_ROWS = 3;
const DANMAKU_SPEEDS = [220, 190, 250]; // seconds per full scroll per row

export function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    guestbookApi.getEntries()
      .then(setEntries)
      .catch(() => addToast('error', '加载留言失败'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!isLoggedIn) return;
    if (!content.trim()) {
      addToast('warning', '请输入留言内容');
      return;
    }

    try {
      setSubmitting(true);
      const entry = await guestbookApi.addEntry({
        author: user?.username || '匿名',
        content: content.trim(),
      });
      setEntries((prev) => [entry, ...prev]);
      setContent('');
      addToast('success', '留言发表成功！');
    } catch {
      addToast('error', '留言发表失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await guestbookApi.deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      addToast('info', '留言已删除');
    } catch {
      addToast('error', '删除失败');
    }
  };

  const isOwner = (author: string) => user?.username === author;
  const charCount = content.length;
  const isOverLimit = charCount > MAX_LENGTH;

  // Danmaku data — shuffle entries into rows
  const danmakuRows = useMemo(() => {
    if (entries.length === 0) return [];
    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    return Array.from({ length: DANMAKU_ROWS }, (_, rowIdx) => {
      // Duplicate entries to fill the scrolling track
      const repeated = [...shuffled, ...shuffled, ...shuffled];
      return repeated.map((entry, i) => (
        <span key={`${rowIdx}-${entry.id}-${i}`} className={styles.danmakuItem}>
          <span className={styles.danmakuAuthor}>{entry.author}</span>
          <span className={styles.danmakuContent}>{entry.content}</span>
        </span>
      ));
    });
  }, [entries]);

  return (
    <div className={styles.guestbook}>
      {/* Danmaku */}
      {danmakuRows.length > 0 && (
        <div className={styles.danmaku}>
          {danmakuRows.map((items, rowIdx) => (
            <div
              key={rowIdx}
              className={styles.danmakuTrack}
              style={{ '--speed': `${DANMAKU_SPEEDS[rowIdx]}s` } as React.CSSProperties}
            >
              <div className={styles.danmakuInner}>
                {items}
                {/* Duplicate inner content for seamless loop */}
                {items}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {isLoggedIn ? (
        <div className={styles.form}>
          <div className={styles.formUser}>
            <div className={styles.formAvatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt="" referrerPolicy="no-referrer" />
              ) : (
                <User size={18} />
              )}
            </div>
            <div className={styles.formUserInfo}>
              <span className={styles.formUsername}>{user?.username}</span>
              <span className={styles.formHint}>留下你的足迹</span>
            </div>
          </div>
          <Textarea
            placeholder="说点什么吧..."
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= MAX_LENGTH + 50) {
                setContent(e.target.value);
              }
            }}
            rows={3}
          />
          <div className={styles.formFooter}>
            <span className={`${styles.charCount} ${isOverLimit ? styles.charOver : ''} ${charCount > MAX_LENGTH * 0.8 ? styles.charWarn : ''}`}>
              {charCount}/{MAX_LENGTH}
            </span>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={!content.trim() || isOverLimit || submitting}
              loading={submitting}
            >
              <Send size={14} />
              发布留言
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.loginPrompt}>
          <div className={styles.loginPromptIcon}>
            <MessageSquare size={28} />
          </div>
          <h3 className={styles.loginPromptTitle}>登录后即可留言</h3>
          <p className={styles.loginPromptDesc}>留下你的足迹，与大家分享想法</p>
          <div className={styles.loginPromptActions}>
            <Link to="/login" className={styles.loginPromptBtn}>
              <LogIn size={15} />
              去登录
            </Link>
            <Link to="/register" className={styles.loginPromptBtnAlt}>
              注册账号
            </Link>
          </div>
        </div>
      )}

      {/* Entries */}
      <div className={styles.entries}>
        {loading ? (
          <div className={styles.empty}>
            <p>加载中...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className={styles.empty}>
            <MessageSquare size={40} className={styles.emptyIcon} />
            <p>还没有留言</p>
            <p className={styles.emptyHint}>来做第一个留言的人吧</p>
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div key={entry.id} className={styles.entry}>
              <div className={styles.entryAvatar}>
                <User size={18} />
              </div>
              <div className={styles.entryBody}>
                <div className={styles.entryHeader}>
                  <span className={styles.entryAuthor}>{entry.author}</span>
                  {idx === 0 && <span className={styles.entryBadge}>最新</span>}
                  <span className={styles.entryTime}>
                    {formatRelativeTime(entry.createdAt)}
                  </span>
                </div>
                <p className={styles.entryContent}>{entry.content}</p>
                <div className={styles.entryFooter}>
                  <span className={styles.entryIndex}>#{entries.length - idx}</span>
                  {isOwner(entry.author) && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(entry.id)}
                      title="删除留言"
                    >
                      <Trash2 size={13} />
                      删除
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
