import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import styles from './SiteUptime.module.css';

const START_DATE = new Date('2025-01-01');

function calcUptime() {
  const now = new Date();
  const diff = now.getTime() - START_DATE.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;
  return { years, months, days: remainingDays, totalDays: days };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function SiteUptime() {
  const [uptime, setUptime] = useState(calcUptime);

  useEffect(() => {
    const timer = setInterval(() => setUptime(calcUptime()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Clock size={16} />
        运行时间
        <span className={styles.dot} />
      </h3>

      <div className={styles.body}>
        <div className={styles.mainCounter}>
          <div className={`${styles.block} ${styles.blockYears}`}>
            <span className={styles.bigNum}>{uptime.years}</span>
            <span className={styles.blockLabel}>年</span>
          </div>
          <span className={styles.sep}>:</span>
          <div className={`${styles.block} ${styles.blockMonths}`}>
            <span className={styles.bigNum}>{pad(uptime.months)}</span>
            <span className={styles.blockLabel}>月</span>
          </div>
          <span className={styles.sep}>:</span>
          <div className={`${styles.block} ${styles.blockDays}`}>
            <span className={styles.bigNum}>{pad(uptime.days)}</span>
            <span className={styles.blockLabel}>天</span>
          </div>
        </div>

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>累计运行</span>
          <span className={styles.totalNum}>{uptime.totalDays.toLocaleString()}</span>
          <span className={styles.totalLabel}>天</span>
        </div>
      </div>
    </div>
  );
}
