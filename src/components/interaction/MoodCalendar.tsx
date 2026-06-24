import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, SmilePlus, CheckCheck, X, GripHorizontal } from 'lucide-react';
import { useMoodTracker } from '../../hooks/useMoodTracker';
import styles from './MoodCalendar.module.css';

/* ================================================================
   Constants
   ================================================================ */

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const MOOD_OPTIONS = [
  { emoji: '😊', label: '开心' },
  { emoji: '🤩', label: '兴奋' },
  { emoji: '🥰', label: '幸福' },
  { emoji: '😎', label: '很酷' },
  { emoji: '🔥', label: '燃起来了' },
  { emoji: '💯', label: '满分' },
  { emoji: '✨', label: '闪闪发光' },
  { emoji: '💗', label: '比心' },
  { emoji: '🥳', label: '开趴' },
  { emoji: '🚀', label: '起飞' },
  { emoji: '💪', label: '加油' },
  { emoji: '🤙', label: '松弛' },
  { emoji: '🤔', label: '思考' },
  { emoji: '🥵', label: '融化了' },
  { emoji: '😐', label: '一般' },
  { emoji: '🐟', label: '摸鱼' },
  { emoji: '😴', label: '疲惫' },
  { emoji: '💤', label: '困了' },
  { emoji: '😰', label: '焦虑' },
  { emoji: '🙃', label: '无语' },
  { emoji: '😢', label: '难过' },
  { emoji: '😭', label: '破防' },
  { emoji: '😡', label: '生气' },
  { emoji: '💢', label: '暴怒' },
];

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function monthDayLabel(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${Number(m)}月${Number(d)}日`;
}

/* ================================================================
   Particle helpers
   ================================================================ */

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  rot: number;
}

const BURST_EMOJIS = ['🔥', '⚡', '🚀', '💥', '✨', '🎉', '🪩', '💫', '🌈', '🏆', '🦄', '🍾', '🎯', '💎', '🤙', '💖', '🫧', '💝'];

let particleBatch = 0;

function spawnParticles(emoji: string, count = 50): Particle[] {
  const batch = ++particleBatch;
  const emojis = [emoji, emoji, emoji, ...BURST_EMOJIS];
  const vw = window.innerWidth;
  return Array.from({ length: count }, (_, i) => ({
    id: batch * 1000 + i,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    x: (Math.random() - 0.5) * vw * 0.9,       // horizontal spread across screen
    y: 0,                                        // unused — controlled by keyframes
    size: 1.0 + Math.random() * 2.5,             // varied sizes
    delay: Math.random() * 3.0,                  // staggered start
    duration: 4.0 + Math.random() * 4.0,         // slow, graceful fall
    rot: (Math.random() - 0.5) * 60,             // gentle tumble
  }));
}

/* ================================================================
   Component
   ================================================================ */

export function MoodCalendar() {
  const today = todayString();
  const now = new Date();

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Stamp animation
  const [selectedDate, setSelectedDate] = useState(today);
  const [stampVisible, setStampVisible] = useState(false);
  const [stampPos, setStampPos] = useState<{ top: number; left: number; width: number; height: number }>({ top: 0, left: 0, width: 0, height: 0 });

  // Celebration particles
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { getMood, setMood, checkIn, isChecked } = useMoodTracker();

  const selectedChecked = isChecked(selectedDate);
  const isSelectedPast = selectedDate < today;

  // ── calendar helpers ──
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawFirst = new Date(viewYear, viewMonth, 1).getDay();
  const firstDayOfWeek = rawFirst === 0 ? 6 : rawFirst - 1;

  const goPrev = useCallback(() => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else { setViewMonth((m) => m - 1); }
  }, [viewMonth]);

  const goNext = useCallback(() => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else { setViewMonth((m) => m + 1); }
  }, [viewMonth]);

  // ── check-in with stamp animation ──
  const handleCheckIn = useCallback(() => {
    const targetCell = document.querySelector(`[data-date="${selectedDate}"]`);
    if (targetCell) {
      const rect = targetCell.getBoundingClientRect();
      setStampPos({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }
    setStampVisible(true);
    setTimeout(() => {
      checkIn(selectedDate);
      setStampVisible(false);
    }, 1400);
  }, [selectedDate, checkIn]);

  // ── emoji picker ──
  const openPicker = useCallback(
    (date: string, el?: HTMLElement) => {
      // Must check in first
      if (!isChecked(date)) return;
      if (el) {
        const rect = el.getBoundingClientRect();
        const popWidth = 420;
        const popHeight = 340;
        let left = rect.left + rect.width / 2 - popWidth / 2;
        if (left < 8) left = 8;
        if (left + popWidth > window.innerWidth - 8) left = window.innerWidth - popWidth - 8;
        const top =
          rect.bottom + 8 + popHeight > window.innerHeight
            ? rect.top - popHeight - 8
            : rect.bottom + 8;
        setPickerPos({ top, left });
      }
      setPickerDate(date);
      setPickerOpen(true);
    },
    [isChecked],
  );

  const closePicker = useCallback(() => {
    setPickerOpen(false);
    setPickerDate(null);
  }, []);

  // ── Picker drag ──
  const handlePickerDragStart = useCallback((e: React.PointerEvent) => {
    const el = pickerRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handlePickerDragMove = useCallback((e: React.PointerEvent) => {
    const el = pickerRef.current;
    if (!el || !el.hasPointerCapture(e.pointerId)) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const pw = el.offsetWidth;
    const ph = el.offsetHeight;
    let left = e.clientX - dragOffset.current.x;
    let top = e.clientY - dragOffset.current.y;
    left = Math.max(0, Math.min(left, w - pw));
    top = Math.max(0, Math.min(top, h - ph));
    setPickerPos({ top, left });
  }, []);

  const handlePickerDragEnd = useCallback((e: React.PointerEvent) => {
    const el = pickerRef.current;
    if (el && el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
  }, []);

  const selectMood = useCallback(
    (emoji: string) => {
      if (!pickerDate) return;
      const current = getMood(pickerDate);
      if (current === emoji) {
        setMood(pickerDate, '');
      } else {
        setMood(pickerDate, emoji);
        // celebration burst
        // Clear any previous particle timer to avoid cutting off new batch
        if (particleTimerRef.current) {
          clearTimeout(particleTimerRef.current);
        }
        setParticles(spawnParticles(emoji));
        particleTimerRef.current = setTimeout(() => {
          setParticles([]);
          particleTimerRef.current = null;
        }, 12000);
      }
      closePicker();
    },
    [pickerDate, getMood, setMood, closePicker],
  );

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        closePicker();
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [pickerOpen, closePicker]);

  // ── build day cells ──
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
  const cells: { date: string | null; day: number | null; isToday: boolean; isFuture: boolean }[] = [];

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDayOfWeek + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ date: null, day: null, isToday: false, isFuture: false });
    } else {
      const dateStr = formatDateStr(viewYear, viewMonth, dayNum);
      cells.push({ date: dateStr, day: dayNum, isToday: dateStr === today, isFuture: dateStr > today });
    }
  }

  const checkedCount = cells.filter((c) => c.date && isChecked(c.date!)).length;

  /* ================================================================
     Render
     ================================================================ */

  return (
    <div className={styles.widget}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h3 className={styles.title}>
            <SmilePlus size={16} />
            每日心情
          </h3>
          <div className={styles.monthNav}>
            <button className={styles.navBtn} onClick={goPrev} aria-label="上个月">
              <ChevronLeft size={14} />
            </button>
            <span className={styles.monthLabel}>
              {viewYear}年{viewMonth + 1}月
            </span>
            <button className={styles.navBtn} onClick={goNext} aria-label="下个月">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className={styles.statsRow}>
          <span className={styles.stat}>本月打卡 <strong>{checkedCount}</strong> 天</span>
        </div>
      </div>

      {/* ── Calendar grid ── */}
      <div className={styles.grid}>
        {WEEKDAYS.map((d) => (
          <div key={d} className={styles.weekday}>{d}</div>
        ))}
        {cells.map((cell, idx) => {
          const mood = cell.date ? getMood(cell.date) : undefined;
          const checked = cell.date ? isChecked(cell.date) : false;
          return (
            <div
              key={idx}
              data-date={cell.date || undefined}
              className={`${styles.cell} ${cell.isToday ? styles.today : ''} ${
                cell.isFuture ? styles.future : ''
              } ${checked ? styles.checked : ''} ${
                cell.date === selectedDate ? styles.selected : ''
              }`}
              onClick={(e) => {
                if (cell.date && !cell.isFuture) {
                  setSelectedDate(cell.date);
                  openPicker(cell.date, e.currentTarget as HTMLElement);
                }
              }}
            >
              {cell.day !== null && (
                <>
                  <span className={styles.dayNum}>{cell.day}</span>
                  <span className={styles.cellIcon}>
                    {checked && (
                      <span className={styles.stampMini}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                    {mood && <span className={styles.moodEmoji}>{mood}</span>}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Action buttons ── */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.checkInBtn} ${selectedChecked ? styles.actionBtnDone : ''}`}
          onClick={handleCheckIn}
          disabled={selectedChecked}
        >
          <CheckCheck size={16} />
          {selectedChecked
            ? '已签到'
            : isSelectedPast
              ? `补签 ${monthDayLabel(selectedDate)}`
              : '签到打卡'}
        </button>
        <button
          className={styles.actionBtn}
          onClick={() => openPicker(selectedDate)}
          disabled={!selectedChecked}
          title={!selectedChecked ? '请先签到打卡' : undefined}
        >
          <span className={styles.actionEmoji}>{getMood(selectedDate) || '✨'}</span>
          {getMood(selectedDate) ? 'emoji' : 'emoji'}
        </button>
      </div>

      {/* ── Stamp animation overlay ── */}
      {stampVisible &&
        createPortal(
          <div
            className={styles.stampOverlay}
            style={{
              top: stampPos.top,
              left: stampPos.left,
              width: stampPos.width,
              height: stampPos.height,
            }}
          >
            <div className={styles.stampOuter}>
              <div className={styles.stampSeal}>
                <span className={styles.stampDate}>{monthDayLabel(selectedDate)}</span>
                <span className={styles.stampText}>已签到</span>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ── Emoji picker popover ── */}
      {pickerOpen &&
        createPortal(
          <div
            ref={pickerRef}
            className={styles.picker}
            style={{ top: pickerPos.top, left: pickerPos.left }}
            onPointerMove={handlePickerDragMove}
            onPointerUp={handlePickerDragEnd}
          >
            <div
              className={styles.pickerHeader}
              onPointerDown={handlePickerDragStart}
            >
              <GripHorizontal size={14} className={styles.dragHandle} />
              <span>选择心情</span>
              <span className={styles.pickerDate}>{pickerDate}</span>
              <button className={styles.pickerClose} onClick={closePicker}>
                <X size={14} />
              </button>
            </div>
            <div className={styles.pickerGrid}>
              {MOOD_OPTIONS.map((opt) => {
                const isSelected = pickerDate ? getMood(pickerDate) === opt.emoji : false;
                return (
                  <button
                    key={opt.emoji}
                    className={`${styles.moodOption} ${isSelected ? styles.moodSelected : ''}`}
                    onClick={() => selectMood(opt.emoji)}
                    title={opt.label}
                  >
                    <span className={styles.moodOptionEmoji}>{opt.emoji}</span>
                    <span className={styles.moodOptionLabel}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {pickerDate && getMood(pickerDate) && (
              <button
                className={styles.clearBtn}
                onClick={() => {
                  if (pickerDate) setMood(pickerDate, '');
                  closePicker();
                }}
              >
                清除记录
              </button>
            )}
          </div>,
          document.body,
        )}

      {/* ── Celebration particles ── */}
      {particles.length > 0 &&
        createPortal(
          <>
            <div className={styles.particleFlash} />
            <div className={styles.particlesContainer}>
              {particles.map((p) => (
                <span
                  key={p.id}
                  className={styles.particle}
                  style={{
                    '--px': `${p.x}px`,
                    '--py': `${p.y}px`,
                    '--size': `${p.size}rem`,
                    '--delay': `${p.delay}s`,
                    '--dur': `${p.duration}s`,
                    '--rot': `${p.rot}deg`,
                  } as React.CSSProperties}
                >
                  {p.emoji}
                </span>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
