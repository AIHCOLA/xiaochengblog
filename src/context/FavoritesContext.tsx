import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as favoritesApi from '../api/favorites';

interface FavoritesContextType {
  favorites: string[]; // post IDs
  loading: boolean;
  toggleFavorite: (postId: string) => Promise<void>;
  isFavorited: (postId: string) => boolean;
  count: number;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load favorites when user changes
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    favoritesApi.getFavorites()
      .then((items) => {
        setFavorites(items.map((item) => String(item.id)));
      })
      .catch(() => {
        setFavorites([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isLoggedIn, user?.id]);

  const toggleFavorite = useCallback(
    async (postId: string): Promise<void> => {
      if (!isLoggedIn) return;

      if (favorites.includes(postId)) {
        await favoritesApi.removeFavorite(postId);
        setFavorites((prev) => prev.filter((id) => id !== postId));
      } else {
        await favoritesApi.addFavorite(postId);
        setFavorites((prev) => [...prev, postId]);
      }
    },
    [isLoggedIn, favorites]
  );

  const isFavorited = useCallback(
    (postId: string) => favorites.includes(postId),
    [favorites]
  );

  const value = useMemo(
    () => ({
      favorites,
      loading,
      toggleFavorite,
      isFavorited,
      count: favorites.length,
    }),
    [favorites, loading, toggleFavorite, isFavorited]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
