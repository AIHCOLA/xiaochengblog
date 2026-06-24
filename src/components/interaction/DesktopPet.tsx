import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './DesktopPet.module.css';

// Auto-discover all GIFs in src/assets/pet/
// Drop a new .gif in the folder — no code change needed
// Name files like "happy.gif", "sleep.gif" for descriptive labels
const petModules = import.meta.glob('../../assets/pet/*.gif', { eager: true, query: '?url', import: 'default' });

const isHashName = (s: string) => /^[a-f0-9]{20,}$/i.test(s);

const EXPRESSIONS = Object.entries(petModules)
  .map(([path, url]) => {
    const raw = path.split('/').pop()!.replace('.gif', '');
    return { id: raw, src: url as string, label: raw };
  })
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((item, i) => ({
    ...item,
    label: isHashName(item.id) ? `表情${i + 1}` : item.label,
  }));

const PET_VISIBLE_KEY = 'blog_desktop_pet_visible';
const PET_EXPR_KEY = 'blog_pet_expression';
const PET_POS_KEY = 'blog_pet_position';

export function DesktopPet() {
  const [visible, setVisible] = useState(() => {
    const saved = localStorage.getItem(PET_VISIBLE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const [exprIdx, setExprIdx] = useState(() => {
    const s = localStorage.getItem(PET_EXPR_KEY);
    return s !== null ? parseInt(s, 10) : 0;
  });

  const [pos, setPos] = useState(() => {
    const saved = localStorage.getItem(PET_POS_KEY);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (typeof p.x === 'number' && typeof p.y === 'number') return { x: p.x, y: p.y };
      } catch {
        const [x, y] = saved.split(',').map(Number);
        if (!isNaN(x) && !isNaN(y)) return { x, y };
      }
    }
    return { x: window.innerWidth - 200, y: window.innerHeight - 280 };
  });

  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState('');

  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const hasDragged = useRef(false);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const petRef = useRef<HTMLDivElement>(null);

  const currentExpr = EXPRESSIONS[exprIdx] || EXPRESSIONS[0];

  // ── Visibility sync with CardPalette ──
  // CardPalette dispatches StorageEvent on toggle; StorageEvent listeners
  // catch same-tab (manual dispatch) and cross-tab (browser-native) changes.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PET_VISIBLE_KEY) setVisible(e.newValue === 'true');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ── Drag handlers ──
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    hasDragged.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
    setPos({
      x: Math.round(dragStart.current.px + dx),
      y: Math.round(dragStart.current.py + dy),
    });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    localStorage.setItem(PET_POS_KEY, JSON.stringify(pos));
  }, [pos]);

  // ── Click to cycle expression ──
  const onClick = useCallback(() => {
    if (hasDragged.current) return;
    const next = (exprIdx + 1) % EXPRESSIONS.length;
    setExprIdx(next);
    localStorage.setItem(PET_EXPR_KEY, String(next));

    const label = EXPRESSIONS[next].label;
    setBubbleText(label);
    setShowBubble(true);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 1500);
  }, [exprIdx]);

  // ── Double-click for random expression ──
  const onDoubleClick = useCallback(() => {
    const others = EXPRESSIONS.map((_, i) => i).filter((i) => i !== exprIdx);
    const random = others[Math.floor(Math.random() * others.length)];
    setExprIdx(random);
    localStorage.setItem(PET_EXPR_KEY, String(random));

    const label = EXPRESSIONS[random].label;
    setBubbleText(label + '!');
    setShowBubble(true);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 1500);
  }, [exprIdx]);

  if (!visible) return null;

  return (
    <div
      ref={petRef}
      className={`${styles.pet} ${dragging.current ? styles.dragging : ''}`}
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      title="月薪喵 — 点击切换表情，双击随机，拖拽移动"
    >
      {showBubble && <div className={styles.bubble}>{bubbleText}</div>}
      <img
        src={currentExpr.src}
        alt={currentExpr.label}
        className={styles.gif}
        draggable={false}
      />
    </div>
  );
}

export { EXPRESSIONS };
