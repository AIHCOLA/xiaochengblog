import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import styles from './LikeButton.module.css';

interface LikeButtonProps {
  initialLikes: number;
  onLike?: () => void;
}

export function LikeButton({ initialLikes, onLike }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (liked) {
      setLiked(false);
      setLikes((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikes((prev) => prev + 1);
      onLike?.();
    }
  };

  return (
    <button
      className={`${styles.button} ${liked ? styles.active : ''}`}
      onClick={handleClick}
      aria-label={liked ? '取消点赞' : '点赞'}
    >
      <ThumbsUp
        size={16}
        className={`${styles.icon} ${liked ? styles.iconActive : ''}`}
        fill={liked ? 'currentColor' : 'none'}
      />
      <span>{likes}</span>
    </button>
  );
}
