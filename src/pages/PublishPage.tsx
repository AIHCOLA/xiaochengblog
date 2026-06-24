import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { useToast } from '../context/ToastContext';
import { calculateReadingTime, generateId } from '../utils/format';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Send, Eye, Edit3, ChevronLeft, Plus, X as XIcon, Check, Upload, Image, Trash2, Star, Columns2 } from 'lucide-react';
import type { Post, Category, Tag } from '../types';
import styles from './PublishPage.module.css';
import '../styles/markdown.css';
import 'highlight.js/styles/github-dark.css';

const COLOR_PRESETS = [
  '#6c5ce7', '#00d4aa', '#e17055', '#0984e3', '#fdcb6e', '#a29bfe',
  '#ff6b6b', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4',
];

type PreviewMode = 'edit' | 'preview' | 'split';

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[一-鿿]+/g, '-')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Frontmatter parser ──
interface ParsedMd {
  metadata: Record<string, string>;
  body: string;
}

function parseFrontmatter(raw: string): ParsedMd {
  const metadata: Record<string, string> = {};
  let body = raw;

  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (match) {
    const fmBlock = match[1];
    body = raw.slice(match[0].length);

    for (const line of fmBlock.split('\n')) {
      const kv = line.match(/^(\w[\w_-]*)\s*:\s*(.+)\s*$/);
      if (kv) {
        const key = kv[1];
        let value = kv[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        metadata[key] = value;
      }
    }
  }

  return { metadata, body };
}

function MarkdownPreview({ content, title, selectedCategory, selectedTags }: {
  content: string;
  title: string;
  selectedCategory?: Category;
  selectedTags: Tag[];
}) {
  return (
    <div className={styles.previewPane}>
      {title ? (
        <h1 className={styles.previewTitle}>{title}</h1>
      ) : (
        <div className={styles.previewPlaceholderTitle}>文章标题</div>
      )}
      {selectedCategory && (
        <span
          className={styles.previewCategory}
          style={{ '--cat-color': selectedCategory.color } as React.CSSProperties}
        >
          {selectedCategory.name}
        </span>
      )}
      {selectedTags.length > 0 && (
        <div className={styles.previewTags}>
          {selectedTags.map((t) => (
            <span key={t.id} className={styles.previewTag}>{t.name}</span>
          ))}
        </div>
      )}
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content || '*在下方编辑器中输入 Markdown 内容即可预览效果*'}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export function PublishPage() {
  const { slug: editSlug } = useParams<{ slug: string }>();
  const { isLoggedIn, isAdmin, user } = useAuth();
  const { getPostBySlug, publishPost, updatePost, isUserPost, allCategories, allTags, addCategory, addTag } = usePosts();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isEditing = !!editSlug;
  const existingPost = editSlug ? getPostBySlug(editSlug) : undefined;

  useEffect(() => {
    if (editSlug) {
      if (!existingPost) {
        addToast('error', '文章不存在');
        navigate('/publish', { replace: true });
      } else if (!isUserPost(editSlug)) {
        addToast('error', '只能编辑自己发布的文章');
        navigate('/publish', { replace: true });
      }
    }
  }, [editSlug, existingPost, isUserPost, navigate, addToast]);

  // Form state
  const [title, setTitle] = useState(existingPost?.title || '');
  const [slug, setSlug] = useState(existingPost?.slug || '');
  const [excerpt, setExcerpt] = useState(existingPost?.excerpt || '');
  const [categorySlug, setCategorySlug] = useState(existingPost?.category.slug || '');
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>(
    existingPost?.tags.map((t) => t.slug) || []
  );
  const [coverImage, setCoverImage] = useState(existingPost?.coverImage || '');
  const [content, setContent] = useState(existingPost?.content || '');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('edit');
  const [featured, setFeatured] = useState(existingPost?.featured || false);

  // ── Custom category form ──
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLOR_PRESETS[0]);

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    const catSlug = slugify(name) || generateId();
    const cat: Category = {
      id: generateId(),
      name,
      slug: catSlug,
      description: '',
      color: newCatColor,
    };
    addCategory(cat);
    setCategorySlug(catSlug);
    setNewCatName('');
    setShowCatForm(false);
    addToast('success', `已添加分类「${name}」`);
  };

  // ── Custom tag form ──
  const [showTagForm, setShowTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleAddTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    const tagSlug = slugify(name) || generateId();
    const tag: Tag = {
      id: generateId(),
      name,
      slug: tagSlug,
    };
    addTag(tag);
    setSelectedTagSlugs((prev) => [...prev, tagSlug]);
    setNewTagName('');
    setShowTagForm(false);
    addToast('success', `已添加标签「${name}」`);
  };

  // ── File upload handler ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      addToast('error', '仅支持 .md 或 .markdown 格式的文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const raw = reader.result as string;
      const { metadata, body } = parseFrontmatter(raw);

      if (!title.trim()) {
        const fmTitle = metadata.title;
        const fileTitle = file.name.replace(/\.(md|markdown)$/i, '');
        setTitle(fmTitle || fileTitle);
        setSlugManuallyEdited(false);
      }

      if (!excerpt.trim() && metadata.excerpt) {
        setExcerpt(metadata.excerpt);
      }

      if (!categorySlug && metadata.category) {
        const catSlug = slugify(metadata.category);
        const found = allCategories.find((c) => c.slug === catSlug);
        if (found) {
          setCategorySlug(catSlug);
        }
      }

      if (selectedTagSlugs.length === 0 && metadata.tags) {
        const tagList = metadata.tags
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        const matched: string[] = [];
        for (const tagName of tagList) {
          const tagSlug = slugify(tagName);
          const found = allTags.find((t) => t.slug === tagSlug);
          if (found) {
            matched.push(tagSlug);
          }
        }
        if (matched.length > 0) setSelectedTagSlugs(matched);
      }

      setContent(body.trim());
      addToast('success', `已加载文件「${file.name}」`);
    };
    reader.readAsText(file);
  };

  // ── Cover image upload handler ──
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      addToast('error', '请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result as string);
      addToast('success', '封面图片已上传');
    };
    reader.readAsDataURL(file);
  };

  const handleClearCover = () => {
    setCoverImage('');
  };

  // Auto-generate slug from title
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    setSlug(val);
  };

  // Validation
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = '请输入文章标题';
    if (!slug.trim()) {
      e.slug = '请输入文章链接';
    } else {
      const existing = getPostBySlug(slug.trim());
      if (existing) {
        if (!isEditing || existing.slug !== editSlug) {
          e.slug = '该链接已被使用，请修改标题或手动修改链接';
        }
      }
    }
    if (!excerpt.trim()) e.excerpt = '请输入文章摘要';
    if (!categorySlug) e.category = '请选择分类';
    if (selectedTagSlugs.length === 0) e.tags = '请至少选择一个标签';
    if (!content.trim()) e.content = '请输入文章内容';
    return e;
  }, [title, slug, excerpt, categorySlug, selectedTagSlugs, content, isEditing, editSlug, getPostBySlug]);

  const isValid = Object.keys(errors).length === 0;

  // Selected category and tag objects
  const selectedCategory = allCategories.find((c) => c.slug === categorySlug);
  const selectedTags = allTags.filter((t) => selectedTagSlugs.includes(t.slug));

  const toggleTag = useCallback((tagSlug: string) => {
    setSelectedTagSlugs((prev) =>
      prev.includes(tagSlug) ? prev.filter((s) => s !== tagSlug) : [...prev, tagSlug]
    );
  }, []);

  const handleSubmit = async () => {
    if (!isValid || !user) return;

    try {
      if (isEditing && existingPost) {
        const updated: Partial<Post> = {
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          category: selectedCategory!,
          tags: selectedTags,
          coverImage: coverImage.trim() || undefined,
          readingTime: calculateReadingTime(content),
          featured,
        };
        await updatePost(editSlug!, updated);
        addToast('success', '文章已更新');
        navigate(`/article/${slug.trim()}`);
      } else {
        const author = {
          name: user.username,
          avatar: user.avatar || '',
          bio: user.bio || '',
          links: {
            ...(user.email ? { email: `mailto:${user.email}` } : {}),
            ...(user.socialLinks || {}),
          },
        };

        const now = new Date().toISOString();

        const post: Post = {
          id: generateId(),
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          category: selectedCategory!,
          tags: selectedTags,
          author,
          coverImage: coverImage.trim() || undefined,
          createdAt: now,
          updatedAt: now,
          readingTime: calculateReadingTime(content),
          featured,
          likes: 0,
          views: 0,
        };
        await publishPost(post);
        addToast('success', '文章发布成功！');
        navigate(`/article/${post.slug}`);
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : '操作失败');
    }
  };

  const wordCount = content.trim() ? content.replace(/\s/g, '').length : 0;

  if (!isLoggedIn || !isAdmin) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.loginPrompt}>
            <h2>{!isLoggedIn ? '请先登录' : '权限不足'}</h2>
            <p>{!isLoggedIn ? '登录后即可发布文章' : '只有管理员可以发布文章'}</p>
            {!isLoggedIn && <Link to="/login" className={styles.loginPromptBtn}>去登录</Link>}
          </div>
        </div>
      </Layout>
    );
  }

  if (isEditing && (!existingPost || !isUserPost(editSlug!))) {
    return (
      <Layout>
        <div className={styles.loading}>加载中...</div>
      </Layout>
    );
  }

  return (
    <Layout sidebar={false}>
      <div className={styles.page}>
        {/* Top bar */}
        <header className={styles.topBar}>
          <button onClick={() => navigate(-1)} className={styles.backLink}>
            <ChevronLeft size={16} />
            返回
          </button>
        </header>

        {/* Page title */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            {isEditing ? (
              <><Edit3 size={20} /> 编辑文章</>
            ) : (
              <><Plus size={20} /> 发布新文章</>
            )}
          </h1>
        </div>

        {/* Main two-column area */}
        <div className={styles.mainGrid}>
          {/* Left: Metadata sidebar */}
          <aside className={styles.metaSidebar}>
            <div className={styles.metaSection}>
              <h3 className={styles.metaSectionTitle}>基本信息</h3>

              <Input
                label="文章标题"
                placeholder="输入一个吸引人的标题..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                error={errors.title}
              />

              <Input
                label="文章链接"
                placeholder="article-permalink"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                error={errors.slug}
              />

              <Textarea
                label="文章摘要"
                placeholder="用一两句话概括这篇文章..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                error={errors.excerpt}
              />
            </div>

            <div className={styles.metaSection}>
              <h3 className={styles.metaSectionTitle}>分类与标签</h3>

              {/* Category */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>分类</label>
                <div className={styles.catGrid}>
                  {allCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.catBtn} ${categorySlug === cat.slug ? styles.catBtnActive : ''}`}
                      style={{ '--cat-color': cat.color } as React.CSSProperties}
                      onClick={() => setCategorySlug(cat.slug)}
                    >
                      {cat.name}
                    </button>
                  ))}
                  {!showCatForm && (
                    <button type="button" className={styles.addBtn} onClick={() => setShowCatForm(true)}>
                      <Plus size={14} /> 新建
                    </button>
                  )}
                </div>

                {showCatForm && (
                  <div className={styles.inlineForm}>
                    <input
                      type="text"
                      className={styles.inlineInput}
                      placeholder="分类名称..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') setShowCatForm(false); }}
                      autoFocus
                    />
                    <div className={styles.colorRow}>
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`${styles.colorDot} ${newCatColor === c ? styles.colorDotActive : ''}`}
                          style={{ background: c }}
                          onClick={() => setNewCatColor(c)}
                        />
                      ))}
                    </div>
                    <div className={styles.inlineActions}>
                      <button type="button" className={styles.inlineConfirm} onClick={handleAddCategory} disabled={!newCatName.trim()}>
                        <Check size={14} /> 添加
                      </button>
                      <button type="button" className={styles.inlineCancel} onClick={() => { setShowCatForm(false); setNewCatName(''); }}>
                        <XIcon size={14} /> 取消
                      </button>
                    </div>
                  </div>
                )}

                {errors.category && <span className={styles.fieldError}>{errors.category}</span>}
              </div>

              {/* Tags */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>标签（多选）</label>
                <div className={styles.tagGrid}>
                  {allTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className={`${styles.tagBtn} ${selectedTagSlugs.includes(tag.slug) ? styles.tagBtnActive : ''}`}
                      onClick={() => toggleTag(tag.slug)}
                    >
                      {selectedTagSlugs.includes(tag.slug) && <XIcon size={12} className={styles.tagCheck} />}
                      {tag.name}
                    </button>
                  ))}
                  {!showTagForm && (
                    <button type="button" className={styles.addBtn} onClick={() => setShowTagForm(true)}>
                      <Plus size={14} /> 新建
                    </button>
                  )}
                </div>

                {showTagForm && (
                  <div className={styles.inlineForm}>
                    <input
                      type="text"
                      className={styles.inlineInput}
                      placeholder="标签名称..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') setShowTagForm(false); }}
                      autoFocus
                    />
                    <div className={styles.inlineActions}>
                      <button type="button" className={styles.inlineConfirm} onClick={handleAddTag} disabled={!newTagName.trim()}>
                        <Check size={14} /> 添加
                      </button>
                      <button type="button" className={styles.inlineCancel} onClick={() => { setShowTagForm(false); setNewTagName(''); }}>
                        <XIcon size={14} /> 取消
                      </button>
                    </div>
                  </div>
                )}

                {errors.tags && <span className={styles.fieldError}>{errors.tags}</span>}
              </div>
            </div>

            <div className={styles.metaSection}>
              <h3 className={styles.metaSectionTitle}>封面与展示</h3>

              {/* Cover Image */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>封面图片（可选）</label>
                <div className={styles.coverInputGroup}>
                  <input
                    type="text"
                    className={styles.coverUrlInput}
                    placeholder="https://example.com/image.jpg"
                    value={coverImage.startsWith('data:') ? '' : coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />
                  <span className={styles.coverOr}>或</span>
                  <label className={styles.coverUploadBtn}>
                    <Image size={14} />
                    <input type="file" accept="image/*" className={styles.fileInput} onChange={handleCoverUpload} />
                  </label>
                  {coverImage && (
                    <button className={styles.coverClearBtn} onClick={handleClearCover} title="清除封面">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                {coverImage && (
                  <div className={styles.coverPreview}>
                    <img src={coverImage} alt="封面预览" className={styles.coverPreviewImg} />
                  </div>
                )}
              </div>

              {/* Featured toggle */}
              <label className={styles.featuredToggle}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span className={styles.featuredCheckbox}>
                  <Star size={14} fill={featured ? 'currentColor' : 'none'} />
                </span>
                <div className={styles.featuredText}>
                  <span className={styles.featuredLabel}>设为精选文章</span>
                  <span className={styles.featuredHint}>精选文章会在首页突出展示</span>
                </div>
              </label>
            </div>
          </aside>

          {/* Right: Content editor */}
          <section className={styles.contentArea}>
            <div className={styles.contentHeader}>
              <label className={styles.fieldLabel}>文章内容（Markdown）</label>
              <div className={styles.contentHeaderActions}>
                <label className={styles.uploadBtn} title="上传 .md 文件">
                  <Upload size={14} />
                  上传 MD
                  <input type="file" accept=".md,.markdown" className={styles.fileInput} onChange={handleFileUpload} />
                </label>
                <div className={styles.modeToggle}>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${previewMode === 'edit' ? styles.modeBtnActive : ''}`}
                    onClick={() => setPreviewMode('edit')}
                    title="仅编辑"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${previewMode === 'split' ? styles.modeBtnActive : ''}`}
                    onClick={() => setPreviewMode('split')}
                    title="分屏预览"
                  >
                    <Columns2 size={14} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${previewMode === 'preview' ? styles.modeBtnActive : ''}`}
                    onClick={() => setPreviewMode('preview')}
                    title="仅预览"
                  >
                    <Eye size={14} />
                  </button>
                </div>
                <span className={styles.wordCount}>{wordCount.toLocaleString()} 字</span>
              </div>
            </div>

            {previewMode === 'edit' && (
              <>
                <textarea
                  className={`${styles.contentEditor} ${errors.content ? styles.inputError : ''}`}
                  placeholder={`# 开始写作...\n\n支持 **Markdown** 语法，包括：\n- 标题\n- 代码块\n- 表格\n- 引用\n\n> 写作是工程师最好的投资。`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                {errors.content && <span className={styles.fieldError}>{errors.content}</span>}
              </>
            )}

            {previewMode === 'preview' && (
              <div className={styles.previewFull}>
                <MarkdownPreview
                  content={content}
                  title={title}
                  selectedCategory={selectedCategory}
                  selectedTags={selectedTags}
                />
              </div>
            )}

            {previewMode === 'split' && (
              <div className={styles.splitPane}>
                <div className={styles.splitEditor}>
                  <textarea
                    className={`${styles.contentEditor} ${styles.splitEditorArea} ${errors.content ? styles.inputError : ''}`}
                    placeholder="# 开始写作..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  {errors.content && <span className={styles.fieldError}>{errors.content}</span>}
                </div>
                <div className={styles.splitPreview}>
                  <MarkdownPreview
                    content={content}
                    title={title}
                    selectedCategory={selectedCategory}
                    selectedTags={selectedTags}
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionBarInner}>
          <div className={styles.actionBarInfo}>
            {isEditing ? '正在编辑文章' : '准备发布新文章'}
          </div>
          <div className={styles.actionBarButtons}>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              取消
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={!isValid}
              onClick={handleSubmit}
              loading={false}
            >
              <Send size={16} />
              {isEditing ? '保存修改' : '发布文章'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
