import { useLocalStorage } from './useLocalStorage';
import type { Category } from '../types';

const CUSTOM_CATEGORIES_KEY = 'blog-custom-categories';
type CustomCategoriesMap = Record<string, Category>;

export function useCustomCategories() {
  const [customMap, setCustomMap] = useLocalStorage<CustomCategoriesMap>(CUSTOM_CATEGORIES_KEY, {});

  const addCategory = (cat: Category): void => {
    setCustomMap((prev) => ({ ...prev, [cat.slug]: cat }));
  };

  const removeCategory = (slug: string): void => {
    setCustomMap((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  };

  const getCustomCategories = (): Category[] => Object.values(customMap);

  return { customCategories: Object.values(customMap), addCategory, removeCategory, getCustomCategories };
}
