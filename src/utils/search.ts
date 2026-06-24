import Fuse from 'fuse.js';
import type { Post } from '../types';

let fuseInstance: Fuse<Post> | null = null;
let postsCache: Post[] = [];

export function createSearchIndex(posts: Post[]): Fuse<Post> {
  if (fuseInstance && postsCache === posts) {
    return fuseInstance;
  }

  fuseInstance = new Fuse(posts, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'excerpt', weight: 1.5 },
      { name: 'content', weight: 1 },
      { name: 'category.name', weight: 0.8 },
      { name: 'tags.name', weight: 0.6 },
    ],
    threshold: 0.4,
    distance: 100,
    includeScore: true,
    minMatchCharLength: 1,
  });

  postsCache = posts;
  return fuseInstance;
}

export function searchPosts(posts: Post[], query: string): Post[] {
  if (!query.trim()) return [];

  const fuse = createSearchIndex(posts);
  const results = fuse.search(query.trim());

  return results.map((r) => r.item);
}

export function highlightMatch(text: string, query: string): { text: string; highlighted: boolean }[] {
  if (!query.trim()) return [{ text, highlighted: false }];

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  );
  const parts = text.split(regex);

  return parts.map((part) => ({
    text: part,
    highlighted: regex.test(part),
  }));
}
