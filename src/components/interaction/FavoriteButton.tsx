import { Heart } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from './FavoriteButton.module.css';

interface FavoriteButtonProps {
  postId: string;
}

export function FavoriteButton({ postId }: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();
  const favorited = isFavorited(postId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      addToast('warning', '请先登录后再收藏文章');
      return;
    }

    await toggleFavorite(postId);
    if (favorited) {
      addToast('info', '已取消收藏');
    } else {
      addToast('success', '已添加到收藏');
    }
  };

  return (
    <button
      className={`${styles.button} ${favorited ? styles.active : ''}`}
      onClick={handleClick}
      aria-label={favorited ? '取消收藏' : '收藏文章'}
    >
      <Heart
        size={18}
        className={`${styles.icon} ${favorited ? styles.iconActive : ''}`}
        fill={favorited ? 'currentColor' : 'none'}
      />
      <span className={styles.label}>
        {favorited ? '已收藏' : '收藏'}
      </span>
    </button>
  );
}
