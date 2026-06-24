import { useState } from 'react';
import { MessageCircle, ThumbsUp, Trash2 } from 'lucide-react';
import type { Comment } from '../../types';
import { formatRelativeTime } from '../../utils/format';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import styles from './CommentItem.module.css';

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];
  onReply: (content: string, author: string, email?: string) => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  isOwner: (author: string) => boolean;
}

export function CommentItem({
  comment,
  replies = [],
  onReply,
  onLike,
  onDelete,
  isOwner,
}: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyName, setReplyName] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitReply = () => {
    if (!replyName.trim() || !replyContent.trim()) return;
    onReply(replyContent.trim(), replyName.trim(), replyEmail.trim() || undefined);
    setShowReply(false);
    setReplyName('');
    setReplyEmail('');
    setReplyContent('');
  };

  return (
    <div className={styles.comment}>
      <div className={styles.avatar}>
        {comment.author.charAt(0).toUpperCase()}
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.author}>{comment.author}</span>
          <span className={styles.time}>{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className={styles.content}>{comment.content}</p>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => onLike(comment.id)}>
            <ThumbsUp size={13} />
            {comment.likes > 0 && comment.likes}
          </button>
          <button className={styles.actionBtn} onClick={() => setShowReply(!showReply)}>
            <MessageCircle size={13} />
            回复
          </button>
          {isOwner(comment.author) && (
            <button className={styles.actionBtn} onClick={() => onDelete(comment.id)}>
              <Trash2 size={13} />
              删除
            </button>
          )}
        </div>

        {/* Reply form */}
        {showReply && (
          <div className={styles.replyForm}>
            <div className={styles.replyInputs}>
              <Input
                placeholder="你的昵称"
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                className={styles.replyNameInput}
              />
              <Input
                placeholder="邮箱（可选）"
                type="email"
                value={replyEmail}
                onChange={(e) => setReplyEmail(e.target.value)}
                className={styles.replyEmailInput}
              />
            </div>
            <Textarea
              placeholder={`回复 ${comment.author}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={3}
            />
            <div className={styles.replyActions}>
              <Button size="sm" variant="ghost" onClick={() => setShowReply(false)}>
                取消
              </Button>
              <Button size="sm" variant="primary" onClick={handleSubmitReply}>
                回复
              </Button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {replies.length > 0 && (
          <div className={styles.replies}>
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
                isOwner={isOwner}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
