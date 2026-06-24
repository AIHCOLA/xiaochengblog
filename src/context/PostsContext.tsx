import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Post, Category, Tag } from '../types';
import * as postsApi from '../api/posts';
import * as categoriesApi from '../api/categories';
import * as tagsApi from '../api/tags';
import { useAuth } from './AuthContext';

const PAGE_SIZE = 20;

interface PostsContextType {
  posts: Post[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  getPostBySlug: (slug: string) => Post | undefined;
  getPostsByCategory: (categorySlug: string) => Post[];
  getPostsByTag: (tagSlug: string) => Post[];
  getFeaturedPosts: () => Post[];
  getRecentPosts: (count?: number) => Post[];
  publishPost: (post: Post) => Promise<void>;
  updatePost: (slug: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (slug: string) => Promise<void>;
  isUserPost: (slug: string) => boolean;
  allCategories: Category[];
  allTags: Tag[];
  addCategory: (cat: Category) => Promise<void>;
  addTag: (tag: Tag) => Promise<void>;
}

const PostsContext = createContext<PostsContextType | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(1);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      pageRef.current = 1;
      const [paginated, fetchedCategories, fetchedTags] = await Promise.all([
        postsApi.getPostsWithPagination(1, PAGE_SIZE),
        categoriesApi.getCategories(),
        tagsApi.getTags(),
      ]);
      setPosts(paginated.posts);
      setHasMore(paginated.hasMore);
      setCategories(fetchedCategories);
      setTags(fetchedTags);
      pageRef.current = 1;
    } catch (err) {
      console.error('Failed to load posts data:', err);
      setPosts([]);
      setCategories([]);
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = pageRef.current + 1;
      const paginated = await postsApi.getPostsWithPagination(nextPage, PAGE_SIZE);
      setPosts((prev) => [...prev, ...paginated.posts]);
      setHasMore(paginated.hasMore);
      pageRef.current = nextPage;
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const getPostBySlug = useCallback(
    (slug: string): Post | undefined => {
      return posts.find((p) => p.slug === slug);
    },
    [posts]
  );

  const getPostsByCategory = useCallback(
    (categorySlug: string): Post[] => {
      return posts
        .filter((p) => p.category.slug === categorySlug)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    [posts]
  );

  const getPostsByTag = useCallback(
    (tagSlug: string): Post[] => {
      return posts
        .filter((p) => p.tags.some((t) => t.slug === tagSlug))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    [posts]
  );

  const getFeaturedPosts = useCallback((): Post[] => {
    return posts
      .filter((p) => p.featured)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts]);

  const getRecentPosts = useCallback(
    (count: number = 5): Post[] => {
      return [...posts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, count);
    },
    [posts]
  );

  const publishPost = useCallback(
    async (post: Post): Promise<void> => {
      const created = await postsApi.createPost({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        categorySlug: post.category.slug,
        tagSlugs: post.tags.map((t) => t.slug),
        featured: post.featured || false,
      });
      setPosts((prev) => [created, ...prev]);
    },
    []
  );

  const updatePost = useCallback(
    async (slug: string, updates: Partial<Post>): Promise<void> => {
      const existing = posts.find((p) => p.slug === slug);
      if (!existing) return;

      const updated = await postsApi.updatePost(slug, {
        title: updates.title || existing.title,
        slug: updates.slug || existing.slug,
        excerpt: updates.excerpt || existing.excerpt,
        content: updates.content || existing.content,
        coverImage: updates.coverImage ?? existing.coverImage,
        categorySlug: updates.category?.slug || existing.category.slug,
        tagSlugs: updates.tags?.map((t) => t.slug) || existing.tags.map((t) => t.slug),
        featured: updates.featured ?? existing.featured ?? false,
      });
      setPosts((prev) => prev.map((p) => (p.slug === slug ? updated : p)));
    },
    [posts]
  );

  const deletePost = useCallback(
    async (slug: string): Promise<void> => {
      await postsApi.deletePost(slug);
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    },
    []
  );

  const isUserPost = useCallback(
    (slug: string): boolean => {
      if (!user) return false;
      const post = posts.find((p) => p.slug === slug);
      return post ? post.author.name === user.username : false;
    },
    [posts, user]
  );

  const addCategory = useCallback(
    async (cat: Category): Promise<void> => {
      const created = await categoriesApi.createCategory({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        color: cat.color,
      });
      setCategories((prev) => {
        if (prev.some((c) => c.slug === created.slug)) return prev;
        return [...prev, created];
      });
    },
    []
  );

  const addTag = useCallback(
    async (tag: Tag): Promise<void> => {
      const created = await tagsApi.createTag({
        name: tag.name,
        slug: tag.slug,
      });
      setTags((prev) => {
        if (prev.some((t) => t.slug === created.slug)) return prev;
        return [...prev, created];
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      posts,
      loading,
      loadingMore,
      hasMore,
      error,
      refresh: loadAll,
      loadMore,
      getPostBySlug,
      getPostsByCategory,
      getPostsByTag,
      getFeaturedPosts,
      getRecentPosts,
      publishPost,
      updatePost,
      deletePost,
      isUserPost,
      allCategories: categories,
      allTags: tags,
      addCategory,
      addTag,
    }),
    [
      posts, loading, loadingMore, hasMore, error, loadAll, loadMore,
      getPostBySlug, getPostsByCategory, getPostsByTag,
      getFeaturedPosts, getRecentPosts,
      publishPost, updatePost, deletePost, isUserPost,
      categories, tags, addCategory, addTag,
    ]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts(): PostsContextType {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}
