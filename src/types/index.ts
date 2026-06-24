// ========== Article Types ==========

export interface Author {
  name: string;
  avatar: string;
  bio: string;
  links: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown
  coverImage?: string;
  category: Category;
  tags: Tag[];
  author: Author;
  createdAt: string; // ISO date
  updatedAt: string;
  readingTime: number; // minutes
  featured?: boolean;
  likes: number;
  views: number;
}

// ========== User Types ==========

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  link?: string;
  socialLinks?: Record<string, string>;
  role?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
}

// ========== Comment Types ==========

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  author: string;
  email?: string;
  content: string;
  createdAt: string;
  likes: number;
}

// ========== Favorite Types ==========

export interface Favorite {
  userId: string;
  postId: string;
  createdAt: string;
}

// ========== Guestbook Types ==========

export interface GuestbookEntry {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

// ========== Notification Types ==========

export interface Notification {
  id: string;
  userId: string;
  type: 'reply' | 'like' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ========== Toast Types ==========

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

// ========== Reading History ==========

export interface ReadingHistoryEntry {
  postId: string;
  postTitle: string;
  postSlug: string;
  readAt: string;
}
