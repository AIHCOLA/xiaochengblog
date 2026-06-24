import { MessageCircle, Heart, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';
import styles from './CTA.module.css';

interface CTAProps {
  postTitle?: string;
}

export function CTA({ postTitle }: CTAProps) {
  return (
    <div className={styles.cta}>
      <div className={styles.glow} />
      <div className={styles.content}>
        <h3 className={styles.title}>
          {postTitle ? `喜欢这篇文章？` : '感谢阅读'}
        </h3>
        <p className={styles.text}>
          如果这篇文章对你有帮助，欢迎分享给更多人。
          <br />
          也欢迎在评论区留下你的想法和问题。
        </p>
        <div className={styles.actions}>
          <Button variant="primary" size="md">
            <MessageCircle size={16} />
            发表评论
          </Button>
          <Button variant="secondary" size="md">
            <Heart size={16} />
            收藏文章
          </Button>
          <Button variant="ghost" size="md">
            <Share2 size={16} />
            分享
          </Button>
        </div>
      </div>
    </div>
  );
}
