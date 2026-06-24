import { useState, useEffect, useCallback } from 'react';
import type { Comment } from '../types';
import * as commentsApi from '../api/comments';

export function useComments(postId: string) {
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load comments on mount
  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    commentsApi.getComments(postId)
      .then(setAllComments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [postId]);

  const postComments = allComments.filter((c) => c.postId === postId);
  const topLevelComments = postComments.filter((c) => !c.parentId);
  const replies = postComments.filter((c) => c.parentId);

  const addComment = useCallback(
    async (content: string, author: string, email?: string, parentId?: string) => {
      const newComment = await commentsApi.addComment(postId, {
        author,
        email,
        content,
        parentId,
      });
      setAllComments((prev) => [...prev, newComment]);
      return newComment;
    },
    [postId]
  );

  const likeComment = useCallback(
    async (commentId: string) => {
      const updated = await commentsApi.likeComment(commentId);
      setAllComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c))
      );
    },
    []
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      await commentsApi.deleteComment(commentId);
      setAllComments((prev) =>
        prev.filter((c) => c.id !== commentId && c.parentId !== commentId)
      );
    },
    []
  );

  return {
    comments: postComments,
    topLevelComments,
    replies,
    addComment,
    likeComment,
    deleteComment,
    loading,
    error,
    totalCount: postComments.length,
  };
}
