import { useCallback, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ALL_CARDS } from './cardRegistry';

export type ColIndex = 0 | 1 | 2;

export interface CardCustomSize {
  h?: number;
  span?: 1 | 2 | 3;
}

export interface DashboardState {
  order: string[];
  columns: Record<string, ColIndex>;
  sizes: Record<string, CardCustomSize>;
}

const STORAGE_KEY = 'blog_dashboard';

function defaultState(): DashboardState {
  const order: string[] = [];
  const columns: Record<string, ColIndex> = {};

  const defaults: { id: string; col: ColIndex }[] = [
    { id: 'mood-calendar', col: 0 },
    { id: 'blog-stats', col: 0 },
    { id: 'vinyl-player', col: 1 },
    { id: 'weather', col: 1 },
    { id: 'search', col: 2 },
  ];

  for (const { id, col } of defaults) {
    order.push(id);
    columns[id] = col;
  }

  return { order, columns, sizes: {} };
}

function migrate(state: DashboardState): DashboardState {
  if (!state || typeof state !== 'object') return defaultState();
  const safeState: DashboardState = {
    order: Array.isArray(state.order) ? state.order : [],
    columns: state.columns && typeof state.columns === 'object' ? state.columns : {},
    sizes: state.sizes && typeof state.sizes === 'object' ? state.sizes : {},
  };
  const migrated: DashboardState = {
    ...safeState,
    columns: { ...safeState.columns },
    sizes: { ...safeState.sizes },
  };
  let changed = false;
  for (const id of Object.keys(migrated.columns)) {
    const val = migrated.columns[id];
    if (val === 'left' as unknown) {
      (migrated.columns as Record<string, ColIndex>)[id] = 0;
      changed = true;
    } else if (val === 'right' as unknown) {
      (migrated.columns as Record<string, ColIndex>)[id] = 1;
      changed = true;
    }
  }
  return changed ? migrated : safeState;
}

export function useDashboard() {
  const [rawState, setState] = useLocalStorage<DashboardState>(STORAGE_KEY, defaultState());
  const state = migrate(rawState);

  const hiddenCards = useMemo(() => {
    const visibleIds = new Set(state.order);
    return ALL_CARDS.filter((c) => !visibleIds.has(c.id));
  }, [state.order]);

  const addCard = useCallback(
    (cardId: string, col: ColIndex) => {
      setState((prev) => {
        if (prev.order.includes(cardId)) return prev;
        return {
          ...prev,
          order: [...prev.order, cardId],
          columns: { ...prev.columns, [cardId]: col },
        };
      });
    },
    [setState],
  );

  const removeCard = useCallback(
    (cardId: string) => {
      setState((prev) => {
        const nextColumns = { ...prev.columns };
        delete nextColumns[cardId];
        const nextSizes = { ...(prev.sizes || {}) };
        delete nextSizes[cardId];
        return {
          ...prev,
          order: prev.order.filter((id) => id !== cardId),
          columns: nextColumns,
          sizes: nextSizes,
        };
      });
    },
    [setState],
  );

  // Move card to a different column + position in one atomic update
  const moveCardTo = useCallback(
    (cardId: string, targetCol: ColIndex, targetIndex: number) => {
      setState((prev) => {
        const nextOrder = [...prev.order];

        // Remove card from current position
        const fromIdx = nextOrder.indexOf(cardId);
        if (fromIdx === -1) return prev;
        nextOrder.splice(fromIdx, 1);

        // Find insertion point: targetIndex among cards in target column (after removal)
        const colCardIds = nextOrder.filter((id) => (prev.columns[id] ?? 0) === targetCol);

        let insertAt: number;
        if (targetIndex >= colCardIds.length) {
          // Insert after last card in target column
          const lastInCol = colCardIds[colCardIds.length - 1];
          insertAt = lastInCol != null ? nextOrder.indexOf(lastInCol) + 1 : nextOrder.length;
        } else {
          // Insert before colCardIds[targetIndex]
          insertAt = nextOrder.indexOf(colCardIds[targetIndex]);
        }

        nextOrder.splice(insertAt, 0, cardId);

        return {
          ...prev,
          order: nextOrder,
          columns: { ...prev.columns, [cardId]: targetCol },
        };
      });
    },
    [setState],
  );

  const updateCardSize = useCallback(
    (cardId: string, size: CardCustomSize) => {
      setState((prev) => ({
        ...prev,
        sizes: { ...(prev.sizes || {}), [cardId]: { ...(prev.sizes || {})[cardId], ...size } },
      }));
    },
    [setState],
  );

  const reset = useCallback(() => {
    setState(defaultState());
  }, [setState]);

  return {
    state,
    hiddenCards,
    addCard,
    removeCard,
    moveCardTo,
    updateCardSize,
    reset,
  };
}
