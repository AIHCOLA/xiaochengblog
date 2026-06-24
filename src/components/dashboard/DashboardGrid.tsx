import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DashboardCard, type CardSize, type CardCustomStyle } from './DashboardCard';
import { CardPalette } from './CardPalette';
import { useDashboard, type ColIndex } from './useDashboard';
import { MoodCalendar } from '../interaction/MoodCalendar';
import { PomodoroTimer } from '../interaction/PomodoroTimer';
import { FlipCard } from '../interaction/FlipCard';
import { BlogStats } from '../interaction/BlogStats';
import { VinylPlayer } from '../interaction/VinylPlayer';
import { WeatherCard } from '../interaction/WeatherCard';
import { SearchCard } from '../interaction/SearchCard';
import { StickyNote } from '../interaction/StickyNote';
import { QuickLinks } from '../interaction/QuickLinks';
import { RandomArticle } from '../interaction/RandomArticle';
import { SiteUptime } from '../interaction/SiteUptime';
import { DailyQuote } from '../interaction/DailyQuote';
import { ContributionHeatmap } from '../interaction/ContributionHeatmap';
import { TodoList } from '../interaction/TodoList';
import { Countdown } from '../interaction/Countdown';
import { HealthReminder } from '../interaction/HealthReminder';
import { Flashcard } from '../interaction/Flashcard';
import { AIChat } from '../interaction/AIChat';
import styles from './DashboardGrid.module.css';

function cardMeta(cardId: string): { component: React.ReactNode; size: CardSize } {
  switch (cardId) {
    case 'mood-calendar':
      return { component: <FlipCard front={<MoodCalendar />} back={<PomodoroTimer />} />, size: 'large' };
    case 'pomodoro':
      return { component: <PomodoroTimer />, size: 'medium' };
    case 'blog-stats':
      return { component: <BlogStats />, size: 'small' };
    case 'vinyl-player':
      return { component: <VinylPlayer />, size: 'small' };
    case 'weather':
      return { component: <WeatherCard />, size: 'small' };
    case 'search':
      return { component: <SearchCard />, size: 'small' };
    case 'sticky-note':
      return { component: <StickyNote />, size: 'medium' };
    case 'quick-links':
      return { component: <QuickLinks />, size: 'medium' };
    case 'random-article':
      return { component: <RandomArticle />, size: 'medium' };
    case 'site-uptime':
      return { component: <SiteUptime />, size: 'small' };
    case 'daily-quote':
      return { component: <DailyQuote />, size: 'small' };
    case 'contribution-heatmap':
      return { component: <ContributionHeatmap />, size: 'medium' };
    case 'todo-list':
      return { component: <TodoList />, size: 'medium' };
    case 'countdown':
      return { component: <Countdown />, size: 'medium' };
    case 'health-reminder':
      return { component: <HealthReminder />, size: 'medium' };
    case 'flashcard':
      return { component: <Flashcard />, size: 'large' };
    case 'ai-chat':
      return { component: <AIChat />, size: 'large' };
    default:
      return { component: null, size: 'medium' };
  }
}

interface ResizeState {
  cardId: string;
  startX: number;
  startY: number;
  currentH: number;
  currentSpan: number;
  minH: number;
}

const COLS = [0, 1, 2] as ColIndex[];

// Make empty columns valid drop targets.
// Non-empty columns use display:contents so cards become grid children and can span columns.
// Empty columns render a visible placeholder box for the droppable area.
function DroppableColumn({ col, isEmpty, children }: { col: number; isEmpty: boolean; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${col}` });

  if (isEmpty) {
    return (
      <div
        ref={setNodeRef}
        className={`${styles.columnEmpty} ${isOver ? styles.columnDropOver : ''}`}
      >
        <div className={styles.columnPlaceholder}>
          <Plus size={20} className={styles.columnPlaceholderIcon} />
          <span className={styles.columnPlaceholderText}>拖拽卡片到此处</span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div ref={setNodeRef} className={styles.column}>
      {children}
    </div>
  );
}

// Wrapper to make a card sortable within its column
function SortableCard({
  id,
  editMode,
  span,
  children,
}: {
  id: string;
  editMode: boolean;
  span: number;
  children: (props: { listeners: ReturnType<typeof useSortable>['listeners']; isDragging: boolean }) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: span > 1 ? `span ${span}` : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ listeners, isDragging })}
    </div>
  );
}

export function DashboardGrid() {
  const {
    state,
    hiddenCards,
    addCard,
    removeCard,
    moveCardTo,
    updateCardSize,
    reset,
  } = useDashboard();

  const [editMode, setEditMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const columnCards = useMemo(() => {
    const cols: Record<number, string[]> = { 0: [], 1: [], 2: [] };
    for (const id of state.order) {
      const col = state.columns[id] ?? 0;
      if (cols[col]) cols[col].push(id);
    }
    return cols;
  }, [state.order, state.columns]);

  // --- Drag and Drop ---
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const cardId = active.id as string;
      const overId = over.id as string;

      // Dropped on an empty column placeholder?
      if (overId.startsWith('col-')) {
        const targetCol = Number(overId.replace('col-', '')) as ColIndex;
        moveCardTo(cardId, targetCol, 0);
        return;
      }

      // Find which column the target card is in
      let targetCol: ColIndex = 0;
      for (const col of COLS) {
        if (columnCards[col].includes(overId)) {
          targetCol = col;
          break;
        }
      }

      const targetIndex = columnCards[targetCol].indexOf(overId);
      moveCardTo(cardId, targetCol, targetIndex >= 0 ? targetIndex : 0);
    },
    [columnCards, moveCardTo],
  );

  // --- Resize ---
  const [resize, setResize] = useState<ResizeState | null>(null);
  const [resizePreview, setResizePreview] = useState<{ h: number; span: number } | null>(null);
  const resizePreviewRef = useRef(resizePreview);
  resizePreviewRef.current = resizePreview;

  const handleResizeStart = useCallback(
    (cardId: string, e: React.PointerEvent) => {
      const custom = state.sizes[cardId];
      const currentSpan = custom?.span ?? 1;
      const size = cardMeta(cardId).size;
      const minH = size === 'small' ? 140 : size === 'medium' ? 200 : 280;
      const currentH = custom?.h ?? minH;

      setResize({ cardId, startX: e.clientX, startY: e.clientY, currentH, currentSpan, minH });
      setResizePreview({ h: currentH, span: currentSpan });
    },
    [state.sizes],
  );

  useEffect(() => {
    if (!resize) return;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - resize.startX;
      const dy = e.clientY - resize.startY;
      const spanDelta = Math.round(dx / 200);
      const newSpan = Math.min(3, Math.max(1, resize.currentSpan + spanDelta));
      const newH = Math.max(resize.minH, resize.currentH + dy);
      setResizePreview({ span: newSpan, h: Math.round(newH) });
    };

    const onUp = () => {
      const preview = resizePreviewRef.current;
      if (preview) {
        updateCardSize(resize.cardId, { h: preview.h, span: preview.span as 1 | 2 | 3 });
      }
      setResize(null);
      setResizePreview(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [resize, updateCardSize]);

  const getCustomSize = useCallback(
    (cardId: string): CardCustomStyle | undefined => {
      if (resize && resize.cardId === cardId && resizePreview) {
        return { h: resizePreview.h, span: resizePreview.span as 1 | 2 | 3 };
      }
      const custom = state.sizes[cardId];
      if (custom?.h || custom?.span) return custom;
      return undefined;
    },
    [state.sizes, resize, resizePreview],
  );

  // Drag overlay content
  const activeCardMeta = activeId ? cardMeta(activeId) : null;
  const activeCustomSize = activeId ? getCustomSize(activeId) : undefined;

  return (
    <div>
      <CardPalette
        hiddenCards={hiddenCards}
        onAdd={addCard}
        onReset={reset}
        editMode={editMode}
        onToggleEdit={() => setEditMode((e) => !e)}
      />

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className={styles.grid}>
          {COLS.map((col) => (
            <SortableContext
              key={col}
              items={columnCards[col]}
              strategy={verticalListSortingStrategy}
            >
              <DroppableColumn col={col} isEmpty={columnCards[col].length === 0}>
                {columnCards[col].map((id) => {
                  const { component, size } = cardMeta(id);
                  if (!component) return null;
                  const customSize = getCustomSize(id);
                  const span = customSize?.span ?? 1;

                  return (
                    <SortableCard key={id} id={id} editMode={editMode} span={span}>
                      {({ listeners, isDragging }) => (
                        <DashboardCard
                          cardId={id}
                          onRemove={removeCard}
                          editMode={editMode}
                          size={size}
                          customSize={customSize}
                          dragListeners={editMode ? listeners : undefined}
                          isDragging={isDragging}
                          onResizeStart={handleResizeStart}
                        >
                          {component}
                        </DashboardCard>
                      )}
                    </SortableCard>
                  );
                })}
              </DroppableColumn>
            </SortableContext>
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCardMeta?.component && (
            <DashboardCard
              cardId={activeId!}
              onRemove={removeCard}
              editMode={false}
              size={activeCardMeta.size}
              customSize={activeCustomSize}
            >
              {activeCardMeta.component}
            </DashboardCard>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
