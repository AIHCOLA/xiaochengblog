import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string | number }[];
}

export function PageHeader({ icon, title, subtitle, stats }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.info}>
        <span className={styles.icon}>{icon}</span>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {stats && stats.length > 0 && (
        <div className={styles.stats}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statItem}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
