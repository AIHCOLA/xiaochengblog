import client from './client';
import type { Post } from '../types';

interface PostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  categorySlug: string;
  tagSlugs: string[];
  featured: boolean;
}

// Response from backend uses different field names
interface PostResponse {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  featured: boolean;
  likes: number;
  views: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    color: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  author: {
    name: string;
    avatar: string;
    bio: string;
    links: Record<string, string>;
  };
}

function toPost(r: PostResponse): Post {
  return {
    id: String(r.id),
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    content: r.content,
    coverImage: r.coverImage,
    category: {
      id: String(r.category.id),
      name: r.category.name,
      slug: r.category.slug,
      description: r.category.description,
      color: r.category.color,
    },
    tags: r.tags.map((t) => ({
      id: String(t.id),
      name: t.name,
      slug: t.slug,
    })),
    author: {
      name: r.author.name,
      avatar: r.author.avatar || '',
      bio: r.author.bio || '',
      links: r.author.links || {},
    },
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    readingTime: r.readingTime,
    featured: r.featured,
    likes: r.likes,
    views: r.views,
  };
}

interface PaginatedPosts {
  items: PostResponse[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface PaginatedResult {
  posts: Post[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasMore: boolean;
}

export async function getPostsWithPagination(page = 1, size = 10): Promise<PaginatedResult> {
  const result = await client.get('/posts', { params: { page, size } }) as unknown as PaginatedPosts;
  return {
    posts: result.items.map(toPost),
    total: result.total,
    page: result.page,
    size: result.size,
    totalPages: result.totalPages,
    hasMore: result.page < result.totalPages,
  };
}

export async function getPosts(page = 1, size = 100): Promise<Post[]> {
  const result = await client.get('/posts', { params: { page, size } }) as unknown as PaginatedPosts;
  return result.items.map(toPost);
}

export async function getFeaturedPosts(): Promise<Post[]> {
  const result = await client.get('/posts/featured') as unknown as PostResponse[];
  return result.map(toPost);
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const result = await client.get(`/posts/${slug}`) as unknown as PostResponse;
  return toPost(result);
}

export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
  // The backend doesn't have a dedicated endpoint for this; we filter on frontend
  const all = await getPosts();
  return all.filter((p) => p.category.slug === categorySlug);
}

export async function getPostsByTag(tagSlug: string): Promise<Post[]> {
  const all = await getPosts();
  return all.filter((p) => p.tags.some((t) => t.slug === tagSlug));
}

export async function searchPosts(query: string): Promise<Post[]> {
  const result = await client.get('/posts/search', { params: { q: query } }) as unknown as PaginatedPosts;
  return result.items.map(toPost);
}

export async function createPost(data: PostInput): Promise<Post> {
  const result = await client.post('/posts', data) as unknown as PostResponse;
  return toPost(result);
}

export async function updatePost(slug: string, data: PostInput): Promise<Post> {
  const result = await client.put(`/posts/${slug}`, data) as unknown as PostResponse;
  return toPost(result);
}

export async function deletePost(slug: string): Promise<void> {
  await client.delete(`/posts/${slug}`);
}
