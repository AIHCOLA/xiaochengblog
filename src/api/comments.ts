import client from './client';
import type { Comment } from '../types';

interface CommentResponse {
  id: number;
  postId: number;
  parentId: number | null;
  author: string;
  email?: string;
  content: string;
  likes: number;
  createdAt: string;
}

function toComment(r: CommentResponse): Comment {
  return {
    id: String(r.id),
    postId: String(r.postId),
    parentId: r.parentId ? String(r.parentId) : null,
    author: r.author,
    email: r.email,
    content: r.content,
    createdAt: r.createdAt,
    likes: r.likes,
  };
}

export async function getComments(postId: string): Promise<Comment[]> {
  const result = await client.get(`/posts/${postId}/comments`) as unknown as CommentResponse[];
  return result.map(toComment);
}

export async function addComment(
  postId: string,
  data: { author: string; email?: string; content: string; parentId?: string }
): Promise<Comment> {
  const payload = {
    ...data,
    parentId: data.parentId ? Number(data.parentId) : null,
  };
  const result = await client.post(`/posts/${postId}/comments`, payload) as unknown as CommentResponse;
  return toComment(result);
}

export async function deleteComment(commentId: string): Promise<void> {
  await client.delete(`/comments/${commentId}`);
}

export async function likeComment(commentId: string): Promise<Comment> {
  const result = await client.post(`/comments/${commentId}/like`) as unknown as CommentResponse;
  return toComment(result);
}
