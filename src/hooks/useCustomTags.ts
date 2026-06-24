import { useLocalStorage } from './useLocalStorage';
import type { Tag } from '../types';

const CUSTOM_TAGS_KEY = 'blog-custom-tags';
type CustomTagsMap = Record<string, Tag>;

export function useCustomTags() {
  const [customMap, setCustomMap] = useLocalStorage<CustomTagsMap>(CUSTOM_TAGS_KEY, {});

  const addTag = (tag: Tag): void => {
    setCustomMap((prev) => ({ ...prev, [tag.slug]: tag }));
  };

  const removeTag = (slug: string): void => {
    setCustomMap((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  };

  const getCustomTags = (): Tag[] => Object.values(customMap);

  return { customTags: Object.values(customMap), addTag, removeTag, getCustomTags };
}
