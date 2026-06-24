import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Calendar, Loader2, Timer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as countdownsApi from '../../api/countdowns';
import styles from './Countdown.module.css';

interface CountdownItem {
  id: number;
  name: string;
  targetDate: string;
}

function calcRemaining(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function Countdown() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CountdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [, setTick] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    countdownsApi.getCountdowns()
      .then((data) => setItems(data.map((c) => ({ id: c.id, name: c.name, targetDate: c.targetDate }))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, authLoading]);

  const addItem = useCallback(async () => {
    const n = name.trim();
    if (!n || !date || submitting) return;
    setSubmitting(true);
    try {
      const targetDate = `${date}T00:00:00`;
      const created = await countdownsApi.createCountdown(n, targetDate);
      setItems((prev) => [...prev, { id: created.id, name: created.name, targetDate: created.targetDate }]);
      setName('');
      setDate('');
      setShowForm(false);
    } catch {
    } finally {
      setSubmitting(false);
    }
  }, [name, date, submitting]);

  const removeItem = useCallback(async (id: number) => {
    const prev = items;
    setItems((cur) => cur.filter((i) => i.id !== id));
    try {
      await countdownsApi.deleteCountdown(id);
    } catch {
      setItems(prev);
    }
  }, [items]);

  if (authLoading) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>
          <Timer size={16} />
          倒计时
        </h3>
        <Loader2 size={16} className={styles.spinner} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>
          <Timer size={16} />
          倒计时
        </h3>
        <p className={styles.empty}>请先登录后使用倒计时</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Timer size={16} />
        倒计时
        <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)} title="添加倒计时">
          <Plus size={14} />
        </button>
      </h3>

      {showForm && (
        <div className={styles.form}>
          <input
            type="text"
            className={styles.input}
            placeholder="事件名称..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
            disabled={submitting}
          />
          <input
            type="date"
            className={styles.input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={submitting}
          />
          <button className={styles.confirmBtn} onClick={addItem} disabled={!name.trim() || !date || submitting}>
            {submitting ? <Loader2 size={14} className={styles.spinner} /> : '添加'}
          </button>
        </div>
      )}

      <div className={styles.list}>
        {loading ? (
          <Loader2 size={16} className={styles.spinner} />
        ) : (
          <>
            {items.map((item) => {
              const r = calcRemaining(item.targetDate);
              return (
                <div key={item.id} className={`${styles.item} ${r.expired ? styles.expired : ''}`}>
                  <div className={styles.itemHeader}>
                    <Calendar size={13} />
                    <span className={styles.itemName}>{item.name}</span>
                    <button className={styles.itemRemove} onClick={() => removeItem(item.id)}>
                      <X size={11} />
                    </button>
                  </div>
                  {r.expired ? (
                    <span className={styles.expiredText}>已到期</span>
                  ) : (
                    <div className={styles.timeRow}>
                      <div className={`${styles.timeBlock} ${styles.timeBlockDays}`}>
                        <span className={styles.timeNum}>{r.days}</span>
                        <span className={styles.timeLabel}>天</span>
                      </div>
                      <div className={`${styles.timeBlock} ${styles.timeBlockHours}`}>
                        <span className={styles.timeNum}>{String(r.hours).padStart(2, '0')}</span>
                        <span className={styles.timeLabel}>时</span>
                      </div>
                      <div className={`${styles.timeBlock} ${styles.timeBlockMins}`}>
                        <span className={styles.timeNum}>{String(r.minutes).padStart(2, '0')}</span>
                        <span className={styles.timeLabel}>分</span>
                      </div>
                      <div className={`${styles.timeBlock} ${styles.timeBlockSecs}`}>
                        <span className={styles.timeNum}>{String(r.seconds).padStart(2, '0')}</span>
                        <span className={styles.timeLabel}>秒</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {items.length === 0 && !showForm && (
              <p className={styles.empty}>添加一个倒计时吧</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
