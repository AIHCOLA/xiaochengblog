import { useState, useCallback, useRef, useEffect } from 'react';
import { Link2, Plus, X, Pencil, PencilOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as quickLinksApi from '../../api/quickLinks';
import styles from './QuickLinks.module.css';

interface LinkItem {
  id: number;
  name: string;
  url: string;
  icon: string;
}

const COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

function getNameHash(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.origin;
  } catch {
    return url;
  }
}

function getFirstChar(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const chineseMatch = trimmed.match(/[一-鿿]/);
  if (chineseMatch) return chineseMatch[0];
  return trimmed[0].toUpperCase();
}

function FaviconIcon({ url, name }: { url: string; name: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const faviconUrl = `${extractDomain(url)}/favicon.ico`;
  const fallbackChar = getFirstChar(name);
  const bgColor = COLORS[getNameHash(name) % COLORS.length];

  useEffect(() => {
    setLoaded(false);
    setError(false);
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
    img.src = faviconUrl;
  }, [faviconUrl]);

  if (loaded && !error) {
    return <img src={faviconUrl} alt="" loading="lazy" className={styles.favicon} onError={() => setError(true)} />;
  }

  return (
    <span className={styles.fallbackIcon} style={{ backgroundColor: bgColor }}>
      {fallbackChar}
    </span>
  );
}

export function QuickLinks() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [customLinks, setCustomLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    quickLinksApi.getAll()
      .then((data) => setCustomLinks(data.map((l) => ({ id: l.id, name: l.name, url: l.url, icon: l.icon }))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, authLoading]);

  const allLinks = customLinks;
  const isEditing = editingId !== null;

  const resetForm = useCallback(() => {
    setNewName('');
    setNewUrl('');
    setAdding(false);
    setEditingId(null);
    setEditMode(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!newName.trim() || !newUrl.trim() || submitting) return;
    let url = newUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const name = newName.trim();

    setSubmitting(true);
    try {
      if (isEditing) {
        const updated = await quickLinksApi.update(editingId, { name, url });
        setCustomLinks((prev) => prev.map((l) => (l.id === editingId ? { ...l, name: updated.name, url: updated.url } : l)));
      } else {
        const created = await quickLinksApi.create({ name, url, icon: '' });
        setCustomLinks((prev) => [...prev, { id: created.id, name: created.name, url: created.url, icon: '' }]);
      }
      resetForm();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }, [newName, newUrl, isEditing, editingId, submitting, resetForm]);

  const handleRemove = useCallback(async (id: number) => {
    const prev = customLinks;
    setCustomLinks((cur) => cur.filter((l) => l.id !== id));
    try {
      await quickLinksApi.remove(id);
    } catch {
      setCustomLinks(prev);
    }
  }, [customLinks]);

  const startEdit = useCallback((link: LinkItem) => {
    setNewName(link.name);
    setNewUrl(link.url);
    setEditingId(link.id);
    setAdding(false);
    setTimeout(() => nameRef.current?.focus(), 50);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') resetForm();
    },
    [handleSave, resetForm],
  );

  if (authLoading || loading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <Link2 size={16} className={styles.icon} />
          <span>快捷链接</span>
        </div>
        <div className={styles.grid}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', opacity: 0.5, margin: '12px auto', display: 'block' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Link2 size={16} className={styles.icon} />
        <span>快捷链接</span>
        <div className={styles.headerBtns}>
          {isLoggedIn && (
            <>
              <button
                className={`${styles.editToggle} ${editMode ? styles.editActive : ''}`}
                onClick={() => setEditMode((m) => !m)}
                title={editMode ? '退出编辑' : '编辑链接'}
              >
                {editMode ? <PencilOff size={13} /> : <Pencil size={13} />}
              </button>
              {!adding && !isEditing && (
                <button
                  className={styles.addToggle}
                  onClick={() => { setAdding(true); setEditMode(false); setTimeout(() => nameRef.current?.focus(), 50); }}
                  title="添加链接"
                >
                  <Plus size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {(adding || isEditing) && (
        <div className={styles.addForm}>
          <span className={styles.formLabel}>{isEditing ? '编辑链接' : '添加链接'}</span>
          <input ref={nameRef} className={styles.addInput} placeholder="网站名称" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={handleKeyDown} disabled={submitting} />
          <input className={styles.addInput} placeholder="网址（例如 juejin.cn）" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} onKeyDown={handleKeyDown} disabled={submitting} />
          <div className={styles.addActions}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={submitting}>
              {submitting ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : isEditing ? '更新' : '保存'}
            </button>
            <button className={styles.cancelBtn} onClick={resetForm}>取消</button>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {allLinks.map((link) => (
          <div key={link.id} className={styles.linkWrap}>
            {editMode ? (
              <button className={styles.link} onClick={() => startEdit(link)} title="点击编辑">
                <span className={styles.linkIcon}><FaviconIcon url={link.url} name={link.name} /></span>
                <span className={styles.linkName}>{link.name}</span>
              </button>
            ) : (
              <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.link} title={link.name}>
                <span className={styles.linkIcon}><FaviconIcon url={link.url} name={link.name} /></span>
                <span className={styles.linkName}>{link.name}</span>
              </a>
            )}
            {editMode && (
              <button className={styles.removeBtn} onClick={() => handleRemove(link.id)} title="删除">
                <X size={11} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
