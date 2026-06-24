import { useState, useCallback, type ReactNode } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import styles from './FlipCard.module.css';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
}

export function FlipCard({ front, back }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const toggle = useCallback(() => {
    setFlipped((f) => !f);
  }, []);

  return (
    <div className={styles.scene}>
      <div className={`${styles.card} ${flipped ? styles.flipped : ''}`}>
        {/* Front */}
        <div className={styles.face} style={{ pointerEvents: flipped ? 'none' : 'auto' }}>
          {front}
          <button className={styles.flipBtn} onClick={toggle} title="翻到番茄钟" style={{ pointerEvents: 'auto' }}>
            <ArrowLeftRight size={14} />
          </button>
        </div>

        {/* Back */}
        <div className={`${styles.face} ${styles.back}`} style={{ pointerEvents: flipped ? 'auto' : 'none' }}>
          {back}
          <button className={styles.flipBtn} onClick={toggle} title="翻回日历" style={{ pointerEvents: 'auto' }}>
            <ArrowLeftRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
