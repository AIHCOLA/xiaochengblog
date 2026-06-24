import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import styles from './PomodoroTimer.module.css';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

type Phase = 'work' | 'break';

export function PomodoroTimer() {
  const [phase, setPhase] = useState<Phase>('work');
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  const totalSeconds = phase === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        // Switch phase
        setPhase((p) => {
          const next = p === 'work' ? 'break' : 'work';
          return next;
        });
        if (phase === 'work') {
          setCompletedCount((c) => c + 1);
        }
        return phase === 'work' ? BREAK_MINUTES * 60 : WORK_MINUTES * 60;
      }
      return prev - 1;
    });
  }, [phase]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  const toggle = useCallback(() => {
    setRunning((r) => !r);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setPhase('work');
    setSecondsLeft(WORK_MINUTES * 60);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const R = 92;
  const circumference = 2 * Math.PI * R;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Timer size={18} />
        <span className={styles.title}>番茄钟</span>
        <span className={`${styles.phaseBadge} ${phase === 'work' ? styles.workBadge : styles.breakBadge}`}>
          {phase === 'work' ? '专注' : '休息'}
        </span>
      </div>

      {/* Circular progress */}
      <div className={styles.ringWrap}>
        <svg className={styles.ring} viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth="6"
          />
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke={phase === 'work' ? 'var(--accent)' : '#22c55e'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
            className={styles.progressRing}
          />
        </svg>
        <div className={styles.timeDisplay}>
          <span className={styles.timeText}>{timeStr}</span>
          <span className={styles.phaseLabel}>
            {phase === 'work' ? '工作时间' : '休息时间'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={toggle} title={running ? '暂停' : '开始'}>
          {running ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button className={styles.ctrlBtn} onClick={reset} title="重置">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <span>
          <span className={styles.checkDot}>
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          {' '}已完成 <strong>{completedCount}</strong> 个专注
        </span>
      </div>
    </div>
  );
}
