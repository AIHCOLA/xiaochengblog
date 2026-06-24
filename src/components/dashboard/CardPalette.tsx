import { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutPanelLeft, Plus, RotateCcw, Pencil, PencilOff } from 'lucide-react';
import type { CardDef } from './cardRegistry';
import type { ColIndex } from './useDashboard';
import styles from './CardPalette.module.css';

const PET_VISIBLE_KEY = 'blog_desktop_pet_visible';
const GIRL_VISIBLE_KEY = 'blog_desktop_girl_visible';

interface CardPaletteProps {
  hiddenCards: CardDef[];
  onAdd: (cardId: string, col: ColIndex) => void;
  onReset: () => void;
  editMode: boolean;
  onToggleEdit: () => void;
}

export function CardPalette({ hiddenCards, onAdd, onReset, editMode, onToggleEdit }: CardPaletteProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pet visibility state
  const [petVisible, setPetVisible] = useState(() => {
    const saved = localStorage.getItem(PET_VISIBLE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  // Girl visibility state
  const [girlVisible, setGirlVisible] = useState(() => {
    const saved = localStorage.getItem(GIRL_VISIBLE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  // Sync visibility from localStorage (cross-tab only; same-tab uses local state)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PET_VISIBLE_KEY) setPetVisible(e.newValue === 'true');
      if (e.key === GIRL_VISIBLE_KEY) setGirlVisible(e.newValue === 'true');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const togglePet = useCallback(() => {
    const next = !petVisible;
    setPetVisible(next);
    localStorage.setItem(PET_VISIBLE_KEY, String(next));
    window.dispatchEvent(new StorageEvent('storage', {
      key: PET_VISIBLE_KEY, newValue: String(next), oldValue: String(!next),
    }));
  }, [petVisible]);

  const toggleGirl = useCallback(() => {
    const next = !girlVisible;
    setGirlVisible(next);
    localStorage.setItem(GIRL_VISIBLE_KEY, String(next));
    window.dispatchEvent(new StorageEvent('storage', {
      key: GIRL_VISIBLE_KEY, newValue: String(next), oldValue: String(!next),
    }));
  }, [girlVisible]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={containerRef}>
      {/* Toggle button */}
      <button
        className={`${styles.toggle} ${open ? styles.toggleActive : ''}`}
        onClick={() => setOpen((o) => !o)}
        title="卡片管理"
      >
        <LayoutPanelLeft size={18} />
      </button>

      {/* Panel */}
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <span>卡片库</span>
            <div className={styles.headerBtns}>
              <button
                className={`${styles.editToggle} ${editMode ? styles.editActive : ''}`}
                onClick={onToggleEdit}
                title={editMode ? '退出编辑' : '编辑模式'}
              >
                {editMode ? <PencilOff size={13} /> : <Pencil size={13} />}
              </button>
              <button className={styles.resetBtn} onClick={onReset} title="恢复默认">
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {hiddenCards.length > 0 ? (
            <div className={styles.list}>
              {hiddenCards.map((card) => (
                <div key={card.id} className={styles.item}>
                  <span className={styles.itemIcon}>{card.icon}</span>
                  <span className={styles.itemName}>{card.name}</span>
                  <div className={styles.itemActions}>
                    {card.id === 'desktop-pet' ? (
                      <button
                        className={`${styles.toggleBtn} ${petVisible ? styles.toggleOn : styles.toggleOff}`}
                        onClick={togglePet}
                        title={petVisible ? '点击隐藏月薪喵' : '点击显示月薪喵'}
                      >
                        <span className={styles.toggleTrack}>
                          <span className={styles.toggleThumb} />
                        </span>
                      </button>
                    ) : card.id === 'desktop-girl' ? (
                      <button
                        className={`${styles.toggleBtn} ${girlVisible ? styles.toggleOn : styles.toggleOff}`}
                        onClick={toggleGirl}
                        title={girlVisible ? '点击隐藏桌面女友' : '点击显示桌面女友'}
                      >
                        <span className={styles.toggleTrack}>
                          <span className={styles.toggleThumb} />
                        </span>
                      </button>
                    ) : (
                      <button
                        className={styles.addBtn}
                        onClick={() => onAdd(card.id, 0)}
                        title="添加卡片"
                      >
                        <Plus size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>所有卡片已添加</p>
          )}
        </div>
      )}
    </div>
  );
}
