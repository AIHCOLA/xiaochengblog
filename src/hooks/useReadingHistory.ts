import { useState, useEffect, useCallback } from 'react';
import type { ReadingHistoryEntry } from '../types';
import * as historyApi from '../api/history';
import { useAuth } from '../context/AuthContext';

export function useReadingHistory() {
  const { isLoggedIn } = useAuth();
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Load history when logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setHistory([]);
      return;
    }

    setLoading(true);
    historyApi.getHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const addToHistory = useCallback(
    async (entry: Omit<ReadingHistoryEntry, 'readAt'>) => {
      if (!isLoggedIn) return;

      await historyApi.addToHistory(entry.postId);
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.postId !== entry.postId);
        return [
          { ...entry, readAt: new Date().toISOString() },
          ...filtered,
        ].slice(0, 50);
      });
    },
    [isLoggedIn]
  );

  const clearHistory = useCallback(async () => {
    await historyApi.clearHistory();
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback(
    (postId: string) => {
      setHistory((prev) => prev.filter((h) => h.postId !== postId));
    },
    []
  );

  return {
    history,
    loading,
    addToHistory,
    clearHistory,
    removeFromHistory,
    count: history.length,
  };
}
