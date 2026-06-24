import { useLocalStorage } from './useLocalStorage';
import type { Post } from '../types';

const USER_POSTS_KEY = 'blog-user-posts';

type UserPostsMap = Record<string, Post>;

export function useUserPosts() {
  const [userPostsMap, setUserPostsMap] = useLocalStorage<UserPostsMap>(USER_POSTS_KEY, {});

  const createPost = (post: Post): void => {
    setUserPostsMap((prev) => ({ ...prev, [post.slug]: post }));
  };

  const updatePost = (slug: string, updates: Partial<Post>): void => {
    setUserPostsMap((prev) => {
      const existing = prev[slug];
      if (!existing) return prev;
      return {
        ...prev,
        [slug]: { ...existing, ...updates, updatedAt: new Date().toISOString() },
      };
    });
  };

  const deletePost = (slug: string): void => {
    setUserPostsMap((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  };

  const getUserPosts = (): Post[] => {
    return Object.values(userPostsMap).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  return { userPostsMap, createPost, updatePost, deletePost, getUserPosts };
}
