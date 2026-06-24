import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, Loader2, Activity, Droplets, PersonStanding, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as healthApi from '../../api/healthReminders';
import styles from './HealthReminder.module.css';

interface ReminderDef {
  id: string;
  name: string;
  icon: React.ReactNode;
  intervalMin: number;
  color: 'blue' | 'green' | 'purple';
}

const REMINDERS: ReminderDef[] = [
  { id: 'water', name: '喝水', icon: <Droplets size={18} />, intervalMin: 60, color: 'blue' },
  { id: 'stand', name: '站立', icon: <PersonStanding size={18} />, intervalMin: 90, color: 'green' },
  { id: 'eyes', name: '眼操', icon: <Eye size={18} />, intervalMin: 45, color: 'purple' },
];

function requestNotifyPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function notify(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '🔔' });
  }
}

export function HealthReminder() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const r of REMINDERS) init[r.id] = 0;
    return init;
  });
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const r of REMINDERS) init[r.id] = false;
    return init;
  });
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    healthApi.getStates()
      .then((states) => {
        const next: Record<string, boolean> = {};
        for (const r of REMINDERS) next[r.id] = states[r.id] || false;
        setActiveMap(next);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, authLoading]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const r of REMINDERS) {
          if (activeMap[r.id]) {
            next[r.id] = (next[r.id] || 0) + 1;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeMap]);

  useEffect(() => {
    for (const r of REMINDERS) {
      if (!activeMap[r.id]) continue;
      const totalSec = r.intervalMin * 60;
      if (elapsed[r.id] >= totalSec && !notifiedRef.current.has(r.id)) {
        notifiedRef.current.add(r.id);
        notify('健康提醒', `${r.name}时间到！`);
      }
    }
  }, [elapsed, activeMap]);

  const toggle = useCallback((id: string) => {
    const nextActive = !activeMap[id];
    setActiveMap((prev) => ({ ...prev, [id]: nextActive }));
    setElapsed((prev) => ({ ...prev, [id]: 0 }));
    notifiedRef.current.delete(id);
    if (isLoggedIn) {
      healthApi.setState(id, nextActive).catch(() => {});
    }
  }, [activeMap, isLoggedIn]);

  const reset = useCallback((id: string) => {
    setElapsed((prev) => ({ ...prev, [id]: 0 }));
    notifiedRef.current.delete(id);
  }, []);

  if (authLoading || loading) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>
          <Activity size={16} />
          健康提醒
        </h3>
        <Loader2 size={16} className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Activity size={16} />
        健康提醒
      </h3>
      <div className={styles.tip} onClick={requestNotifyPermission}>
        <Bell size={11} />
        点击启用通知
      </div>
      <div className={styles.list}>
        {REMINDERS.map((r) => {
          const totalSec = r.intervalMin * 60;
          const e = elapsed[r.id] || 0;
          const remaining = Math.max(0, totalSec - e);
          const min = Math.floor(remaining / 60);
          const sec = remaining % 60;
          const progress = activeMap[r.id] ? (e / totalSec) * 100 : 0;
          const active = activeMap[r.id];

          return (
            <div key={r.id} className={`${styles.item} ${active ? styles.itemActive : ''}`}>
              <div className={styles.itemRow}>
                <div className={`${styles.iconWrap} ${styles[`iconWrap_${r.color}`]}`}>
                  {r.icon}
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>{r.name}</span>
                  <span className={styles.interval}>每 {r.intervalMin} 分钟</span>
                </div>
                <div className={styles.countdown}>
                  {active ? (
                    <>
                      <span className={styles.countdownNum}>{min}</span>
                      <span className={styles.countdownSep}>:</span>
                      <span className={styles.countdownNum}>{String(sec).padStart(2, '0')}</span>
                    </>
                  ) : (
                    <span className={styles.pausedText}>暂停</span>
                  )}
                </div>
                <div className={styles.actions}>
                  <button
                    className={`${styles.toggleBtn} ${active ? styles.toggleActive : ''}`}
                    onClick={() => toggle(r.id)}
                    title={active ? '暂停' : '开始'}
                  >
                    {active ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                  <button className={styles.resetBtn} onClick={() => reset(r.id)} title="重置">
                    <RotateCcw size={13} />
                  </button>
                </div>
              </div>
              {active && (
                <div className={styles.progressBar}>
                  <div className={styles.progressTrack}>
                    <div
                      className={`${styles.progressFill} ${styles[`progress_${r.color}`]}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
