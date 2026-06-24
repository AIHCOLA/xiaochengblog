import { type ReactNode } from 'react';
import { GripVertical, X } from 'lucide-react';
import styles from './DashboardCard.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DragListeners = any;

export type CardSize = 'small' | 'medium' | 'large';

export interface CardCustomStyle {
  h?: number;
  span?: 1 | 2 | 3;
}

interface DashboardCardProps {
  cardId: string;
  children: ReactNode;
  onRemove: (id: string) => void;
  editMode: boolean;
  size?: CardSize;
  customSize?: CardCustomStyle;
  dragListeners?: DragListeners;
  isDragging?: boolean;
  onResizeStart?: (cardId: string, e: React.PointerEvent) => void;
}

export function DashboardCard({
  cardId,
  children,
  onRemove,
  editMode,
  size = 'medium',
  customSize,
  dragListeners,
  isDragging,
  onResizeStart,
}: DashboardCardProps) {
  const span = customSize?.span ?? 1;
  const customH = customSize?.h;

  return (
    <div
      className={`${styles.wrapper} ${isDragging ? styles.dragging : ''}`}
      data-size={size}
      data-span={span}
      data-edit={editMode}
      style={{
        minHeight: customH ? `${customH}px` : undefined,
      }}
    >
      <div className={styles.controls}>
        {editMode && (
          <>
            <span
              className={styles.dragHandle}
              title="拖动排序"
              {...dragListeners}
            >
              <GripVertical size={14} />
            </span>
            <button
              className={styles.ctrlBtn}
              onClick={() => onRemove(cardId)}
              title="移除卡片"
            >
              <X size={13} />
            </button>
          </>
        )}
      </div>

      <div className={styles.content}>
        {children}
      </div>

      {editMode && (
        <div
          className={styles.resizeHandle}
          onPointerDown={(e) => onResizeStart?.(cardId, e)}
          title="拖拽调整大小"
        />
      )}
    </div>
  );
}
