import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Calendar, Clock, Eye, Tag as TagIcon, FolderOpen, ChevronLeft, Edit3, Trash2, Star, ExternalLink, Mail } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import type { Post } from '../../types';
import { formatDate } from '../../utils/format';
import { generateHeadingId, getTextFromChildren } from '../../utils/headings';
import { useReadingHistory } from '../../hooks/useReadingHistory';
import { usePosts } from '../../context/PostsContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FavoriteButton } from '../interaction/FavoriteButton';
import { CTA } from '../author/CTA';
import { CodeBlock } from './CodeBlock';
import { ImageLightbox } from '../ui/ImageLightbox';
import styles from './ArticleDetail.module.css';
import '../../styles/markdown.css';
import 'highlight.js/styles/github-dark.css';

interface ArticleDetailProps {
  post: Post;
}

export function ArticleDetail({ post }: ArticleDetailProps) {
  const { addToHistory } = useReadingHistory();
  const { deletePost, updatePost, isUserPost } = usePosts();
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const canEdit = isLoggedIn && isUserPost(post.slug);

  const handleDelete = () => {
    if (!confirm(`确定要删除「${post.title}」吗？此操作不可撤销。`)) return;
    deletePost(post.slug);
    addToast('success', '文章已删除');
    navigate('/', { replace: true });
  };

  const handleToggleFeatured = () => {
    updatePost(post.slug, { featured: !post.featured });
    addToast('success', post.featured ? '已取消精选' : '已设为精选');
  };

  useEffect(() => {
    addToHistory({
      postId: post.id,
      postTitle: post.title,
      postSlug: post.slug,
    });
    window.scrollTo(0, 0);
  }, [post.id, post.slug, post.title, addToHistory]);

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Build custom markdown components so that headings get ids
  // and code blocks get the enhanced CodeBlock wrapper.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markdownComponents = useMemo<any>(() => {
    // Generate heading renderers for h2-h4 — each auto-assigns an id for ToC linking
    const headingRenderers = Object.fromEntries(
      (['h2', 'h3', 'h4'] as const).map((Tag) => [
        Tag,
        ({ children, ...props }: Record<string, unknown>) => {
          const id = generateHeadingId(getTextFromChildren(children as React.ReactNode));
          return <Tag id={id} {...props}>{children as React.ReactNode}</Tag>;
        },
      ]),
    );

    return {
      ...headingRenderers,
      img: ({ src, alt }: { src?: string; alt?: string }) => (
        <img
          src={src}
          alt={alt || ''}
          loading="lazy"
          style={{ cursor: 'zoom-in' }}
          onClick={() => src && setLightboxSrc(src)}
        />
      ),
      pre: ({ children, ...props }: Record<string, unknown>) => {
        const codeEl = children as { props?: { className?: string; children?: string } } | undefined;
        const className = codeEl?.props?.className || '';
        const match = className.match(/language-(\w+)/);
        const language = match ? match[1] : '';
        const code = (codeEl?.props?.children as string) || '';

        return (
          <CodeBlock language={language} code={code}>
            <pre {...props}>{children as React.ReactNode}</pre>
          </CodeBlock>
        );
      },
    };
  }, []);

  return (
    <article className={styles.article}>
      {/* Back link */}
      <button onClick={() => navigate(-1)} className={styles.backLink}>
        <ChevronLeft size={16} />
        返回
      </button>

      {/* Edit / Delete / Feature for user posts */}
      {canEdit && (
        <div className={styles.ownerActions}>
          <Link to={`/publish/${post.slug}`} className={styles.editBtn}>
            <Edit3 size={14} />
            编辑
          </Link>
          <button
            className={`${styles.featureBtn} ${post.featured ? styles.featureBtnActive : ''}`}
            onClick={handleToggleFeatured}
            title={post.featured ? '取消精选' : '设为精选'}
          >
            <Star size={14} fill={post.featured ? 'currentColor' : 'none'} />
            {post.featured ? '精选' : '精选'}
          </button>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            <Trash2 size={14} />
            删除
          </button>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.meta}>
          <Link
            to={`/category/${post.category.slug}`}
            className={styles.category}
            style={{ '--cat-color': post.category.color } as React.CSSProperties}
          >
            <FolderOpen size={14} />
            {post.category.name}
          </Link>
          <span className={styles.metaItem}>
            <Calendar size={14} />
            {formatDate(post.createdAt)}
          </span>
          <span className={styles.metaItem}>
            <Clock size={14} />
            {post.readingTime} 分钟阅读
          </span>
          <span className={styles.metaItem}>
            <Eye size={14} />
            {post.views.toLocaleString()} 次阅读
          </span>
        </div>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <Link key={tag.id} to={`/tag/${tag.slug}`} className={styles.tag}>
              <TagIcon size={12} />
              {tag.name}
            </Link>
          ))}
        </div>
      </header>

      {/* Divider */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <div className={styles.dividerDot} />
        <div className={styles.dividerLine} />
      </div>

      {/* Content */}
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={markdownComponents}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Actions bar */}
      <div className={styles.actionsBar}>
        <FavoriteButton postId={post.id} />
        <span className={styles.actionsStats}>
          <Eye size={15} /> {post.views.toLocaleString()} 阅读
        </span>
      </div>

      {/* Author info at bottom — only for logged-in users */}
      {isLoggedIn && (
      <div className={styles.authorBox}>
        <div className={styles.authorAvatar}>
          {post.author.avatar ? (
            <img src={post.author.avatar} alt="" loading="lazy" referrerPolicy="no-referrer" className={styles.authorAvatarImg} />
          ) : (
            <span>{post.author.name?.charAt(0).toUpperCase() || '?'}</span>
          )}
        </div>
        <div className={styles.authorInfo}>
          <h4 className={styles.authorName}>{post.author.name}</h4>
          <p className={styles.authorBio}>{post.author.bio}</p>
          {Object.keys(post.author.links).length > 0 && (
            <div className={styles.authorLinks}>
              {Object.entries(post.author.links).map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" className={styles.authorLink}>
                  {name === 'email' || url.startsWith('mailto:') ? <Mail size={11} /> : <ExternalLink size={11} />}
                  {name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* CTA */}
      <CTA postTitle={post.title} />

      {/* Image lightbox */}
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </article>
  );
}
