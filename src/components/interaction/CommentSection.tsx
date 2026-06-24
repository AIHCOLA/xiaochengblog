import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../context/AuthContext';
import { CommentItem } from './CommentItem';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import styles from './CommentSection.module.css';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { topLevelComments, replies, addComment, likeComment, deleteComment } = useComments(postId);
  const { user } = useAuth();

  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !content.trim()) return;
    await addComment(content.trim(), name.trim(), email.trim() || undefined);
    setContent('');
  };

  const handleReply = (parentId: string) => async (replyContent: string, replyAuthor: string, replyEmail?: string) => {
    await addComment(replyContent, replyAuthor, replyEmail, parentId);
  };

  const isOwner = (author: string) => {
    return user?.username === author;
  };

  const totalComments = topLevelComments.length + replies.length;

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>
        <MessageCircle size={20} />
        评论 ({totalComments})
      </h3>

      {/* Comment form */}
      <div className={styles.form}>
        <div className={styles.formInputs}>
          <Input
            placeholder="昵称 *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.nameInput}
          />
          <Input
            placeholder="邮箱（可选）"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.emailInput}
          />
        </div>
        <Textarea
          placeholder="写下你的评论..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        <div className={styles.formFooter}>
          <span className={styles.formHint}>
            支持 Markdown 语法
          </span>
          <Button
            size="md"
            variant="primary"
            onClick={handleSubmit}
            disabled={!name.trim() || !content.trim()}
          >
            发表评论
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {topLevelComments.length > 0 ? (
        <div className={styles.list}>
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={replies.filter((r) => r.parentId === comment.id)}
              onReply={handleReply(comment.id)}
              onLike={likeComment}
              onDelete={deleteComment}
              isOwner={isOwner}
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>暂无评论，来发表第一条评论吧</p>
      )}
    </section>
  );
}
