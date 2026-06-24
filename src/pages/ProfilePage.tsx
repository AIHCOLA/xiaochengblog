import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { usePosts } from '../context/PostsContext';
import { ArticleCard } from '../components/article/ArticleCard';
import { User, Heart, Settings, Save, FileText, BookOpen, CalendarCheck, TrendingUp, PieChart, BarChart3, Activity, Music, MessageSquare, Maximize2, X, Plus, Trash2, ExternalLink, Mail } from 'lucide-react';
import { useReadingHistory } from '../hooks/useReadingHistory';
import { useMoodTracker } from '../hooks/useMoodTracker';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import * as healthApi from '../api/healthReminders';
import * as musicApi from '../api/musicPlaylist';
import * as guestbookApi from '../api/guestbook';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { user, isLoggedIn, updateProfile } = useAuth();
  const { favorites } = useFavorites();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [socialLinkEntries, setSocialLinkEntries] = useState<{ key: string; value: string }[]>([]);

  const { posts } = usePosts();
  const { history, count: historyCount } = useReadingHistory();
  const { checkIns } = useMoodTracker();

  const [healthStates, setHealthStates] = useState<Record<string, boolean>>({});
  const [playlist, setPlaylist] = useState<musicApi.PlaylistEntry[]>([]);
  const [guestbookEntries, setGuestbookEntries] = useState<{ createdAt: string }[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    healthApi.getStates().then(setHealthStates).catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    musicApi.getPlaylist().then(setPlaylist).catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    guestbookApi.getEntries().then(setGuestbookEntries).catch(() => {});
  }, []);

  const favoritePosts = posts.filter((p) => favorites.includes(p.id));
  const checkInCount = Object.keys(checkIns).length;
  const myPostsCount = posts.filter((p) => p.author?.name === user?.username).length;

  // Category donut data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      const name = p.category?.name || '未分类';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [posts]);

  // Reading activity line data (last 30 days)
  const historyLineData = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      dateCounts[key] = 0;
    }
    history.forEach((h) => {
      const d = h.readAt.slice(0, 10);
      const parts = d.split('-');
      const key = `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
      if (dateCounts[key] !== undefined) dateCounts[key] += 1;
      else dateCounts[key] = 1;
    });
    return Object.entries(dateCounts).map(([date, count]) => ({ date, count }));
  }, [history]);

  // Check-in line data (last 30 days)
  const checkInLineData = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      dateCounts[key] = 0;
    }
    Object.keys(checkIns).forEach((dateStr) => {
      const parts = dateStr.split('-');
      const key = `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
      if (dateCounts[key] !== undefined) dateCounts[key] = 1;
    });
    return Object.entries(dateCounts).map(([date, checked]) => ({ date, checked }));
  }, [checkIns]);

  // Archive: posts by month (last 12 months)
  const archiveBarData = useMemo(() => {
    const counts: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = 0;
    }
    posts.forEach((p) => {
      if (!p.createdAt) return;
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (counts[key] !== undefined) counts[key]++;
    });
    return Object.entries(counts).map(([month, count]) => {
      const [, m] = month.split('-');
      return { month: `${parseInt(m, 10)}月`, count };
    });
  }, [posts]);

  // Health reminder bar data
  const healthBarData = useMemo(() => {
    const defs = [
      { id: 'water', name: '喝水' },
      { id: 'stand', name: '站立' },
      { id: 'eyes', name: '眼操' },
    ];
    return defs.map((r) => ({ name: r.name, active: healthStates[r.id] ? 1 : 0 }));
  }, [healthStates]);

  // Music fee donut data
  const musicFeeData = useMemo(() => {
    const counts: Record<string, number> = { '免费': 0, 'VIP': 0, '付费': 0 };
    playlist.forEach((s) => {
      if (s.fee === 0) counts['免费']++;
      else if (s.fee === 1) counts['VIP']++;
      else counts['付费']++;
    });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [playlist]);

  // Guestbook entries by month (last 12 months)
  const guestbookLineData = useMemo(() => {
    const counts: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = 0;
    }
    guestbookEntries.forEach((e) => {
      const d = new Date(e.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (counts[key] !== undefined) counts[key]++;
    });
    return Object.entries(counts).map(([month, count]) => {
      const [, m] = month.split('-');
      return { month: `${parseInt(m, 10)}月`, count };
    });
  }, [guestbookEntries]);

  const DONUT_COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];
  const MUSIC_FEE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  // Chart expand modal
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  useEffect(() => {
    if (!expandedChart) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedChart(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expandedChart]);

  const closeExpanded = useCallback(() => setExpandedChart(null), []);

  const renderExpandedChart = (key: string) => {
    const h = 480;
    switch (key) {
      case 'archive':
        return (
          <ResponsiveContainer width="100%" height={h}>
            <BarChart data={archiveBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} width={32} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }} labelStyle={{ color: 'var(--text-primary)' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'reading':
        return (
          <ResponsiveContainer width="100%" height={h}>
            <LineChart data={historyLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} interval={3} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} width={32} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }} labelStyle={{ color: 'var(--text-primary)' }} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'checkin':
        return (
          <ResponsiveContainer width="100%" height={h}>
            <LineChart data={checkInLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} interval={3} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} width={32} domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v: number) => v === 1 ? '✓' : ''} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }} labelStyle={{ color: 'var(--text-primary)' }} formatter={(value: unknown) => value === 1 ? '已签到' : '未签到'} />
              <Line type="stepAfter" dataKey="checked" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'guestbook':
        return (
          <ResponsiveContainer width="100%" height={h}>
            <LineChart data={guestbookLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} width={32} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }} labelStyle={{ color: 'var(--text-primary)' }} />
              <Line type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#ec4899' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'health':
        return (
          <ResponsiveContainer width="100%" height={h}>
            <BarChart data={healthBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 1]} ticks={[0, 1]} tick={{ fontSize: 13, fill: 'var(--text-muted)' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 14, fill: 'var(--text-primary)' }} width={50} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }} formatter={(value: unknown) => value === 1 ? '已开启' : '未开启'} />
              <Bar dataKey="active" radius={[0, 4, 4, 0]} barSize={32}>
                {healthBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.active ? '#10b981' : 'var(--border)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'category':
        return (
          <ResponsiveContainer width="100%" height={h}>
            <RePieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={100} outerRadius={180} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }} />
            </RePieChart>
          </ResponsiveContainer>
        );
      case 'music':
        return (
          <ResponsiveContainer width="100%" height={h}>
            <RePieChart>
              <Pie data={musicFeeData} cx="50%" cy="50%" innerRadius={100} outerRadius={180} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {musicFeeData.map((_, i) => (
                  <Cell key={i} fill={MUSIC_FEE_COLORS[i % MUSIC_FEE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }} />
            </RePieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const chartTitles: Record<string, string> = {
    archive: '文章归档（近12月）',
    reading: '阅读趋势（近30天）',
    checkin: '签到记录（近30天）',
    guestbook: '访客留言趋势（近12月）',
    health: '健康提醒',
    category: '文章分类',
    music: '音乐版权分布',
  };

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.avatar}>
              <span>?</span>
            </div>
            <div className={styles.headerInfo}>
              <h1 className={styles.title}>个人中心</h1>
              <p className={styles.headerBio}>登录后可查看个人数据统计与管理</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Link to="/login" className={styles.loginPromptBtn}>去登录</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSave = async () => {
    const links: Record<string, string> = {};
    socialLinkEntries.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) links[key.trim()] = value.trim();
    });
    await updateProfile({
      username: username.trim(),
      email: email.trim(),
      bio: bio.trim(),
      avatar: avatarUrl.trim(),
      socialLinks: links,
    });
    setEditing(false);
    addToast('success', '个人资料已更新');
  };

  const tabs = [
    { key: 'profile', label: '个人主页', icon: User },
    { key: 'favorites', label: '我的收藏', icon: Heart, count: favorites.length },
  ];

  const STATS = [
    { key: 'posts', icon: FileText, value: myPostsCount, label: '发表文章' },
    { key: 'favs', icon: Heart, value: favorites.length, label: '收藏文章' },
    { key: 'history', icon: BookOpen, value: historyCount, label: '阅读记录' },
    { key: 'checkin', icon: CalendarCheck, value: checkInCount, label: '签到天数' },
  ];

  return (
    <>
    <Layout>
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.avatar}>
            {user?.avatar ? (
              <img src={user.avatar} alt="" referrerPolicy="no-referrer" className={styles.avatarImg} />
            ) : (
              <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
          {editing ? (
            <div className={styles.headerEditForm}>
              <Input
                label="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                label="邮箱"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="头像 URL"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
              <Textarea
                label="个人简介"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="介绍一下自己..."
              />

              <div className={styles.socialSection}>
                <span className={styles.socialLabel}>联系方式</span>
                {socialLinkEntries.map((entry, i) => (
                  <div key={i} className={styles.socialRow}>
                    <input
                      className={styles.socialKey}
                      placeholder="平台"
                      value={entry.key}
                      onChange={(e) => {
                        const next = [...socialLinkEntries];
                        next[i] = { ...next[i], key: e.target.value };
                        setSocialLinkEntries(next);
                      }}
                    />
                    <input
                      className={styles.socialValue}
                      placeholder="链接 URL"
                      value={entry.value}
                      onChange={(e) => {
                        const next = [...socialLinkEntries];
                        next[i] = { ...next[i], value: e.target.value };
                        setSocialLinkEntries(next);
                      }}
                    />
                    <button
                      className={styles.socialRemove}
                      onClick={() => setSocialLinkEntries((prev) => prev.filter((_, j) => j !== i))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  className={styles.socialAdd}
                  onClick={() => setSocialLinkEntries((prev) => [...prev, { key: '', value: '' }])}
                >
                  <Plus size={14} />
                  添加联系方式
                </button>
              </div>

              <div className={styles.editActions}>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  取消
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  <Save size={16} />
                  保存
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.headerInfo}>
                <h1 className={styles.title}>{user?.username}</h1>
                <p className={styles.headerBio}>{user?.bio || '暂无简介'}</p>
                {(user?.email || (user?.socialLinks && Object.keys(user.socialLinks).length > 0)) && (
                  <div className={styles.socialBadges}>
                    {user.email && (
                      <a key="email" href={`mailto:${user.email}`} className={styles.socialBadge}>
                        <Mail size={12} />
                        {user.email}
                      </a>
                    )}
                    {user?.socialLinks && Object.entries(user.socialLinks).map(([name, url]) => (
                      <a key={name} href={url} target="_blank" rel="noopener noreferrer" className={styles.socialBadge}>
                        <ExternalLink size={12} />
                        {name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <button
                className={styles.headerEditBtn}
                onClick={() => {
                  setEditing(true);
                  setBio(user?.bio || '');
                  setUsername(user?.username || '');
                  setEmail(user?.email || '');
                  setAvatarUrl(user?.avatar || '');
                  const entries = Object.entries(user?.socialLinks || {}).map(([key, value]) => ({ key, value }));
                  setSocialLinkEntries(entries);
                }}
                title="编辑资料"
              >
                <Settings size={15} />
                编辑资料
              </button>
            </>
          )}
        </header>

        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              className={`${styles.tab} ${activeTab === key ? styles.active : ''}`}
              onClick={() => setSearchParams({ tab: key })}
            >
              <Icon size={16} />
              {label}
              {count !== undefined && (
                <span className={styles.tabCount}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className={styles.tabContent}>
            {/* Dashboard stats */}
            <div className={styles.dashboard}>
              {STATS.map(({ key, icon: Icon, value, label }) => (
                <div key={key} className={styles.statCard}>
                  <div className={styles.statIconWrap}>
                    <Icon size={18} />
                  </div>
                  <span className={styles.statValue}>{value}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>

            {/* 内容概览 */}
            <div>
              <h3 className={styles.sectionHeading}>内容概览</h3>
              <div className={`${styles.chartsGrid} ${styles.span1}`}>
                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <BarChart3 size={14} className={styles.chartHeaderIcon} />
                    <span>文章归档（近12月）</span>
                    <button className={styles.chartExpandBtn} onClick={() => setExpandedChart('archive')} title="放大">
                      <Maximize2 size={14} />
                    </button>
                  </div>
                  {archiveBarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={archiveBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} interval={1} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={28} />
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }} labelStyle={{ color: 'var(--text-primary)' }} />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className={styles.chartEmpty}>暂无文章数据</div>
                  )}
                </div>
              </div>
            </div>

            {/* 活跃趋势 */}
            <div>
              <h3 className={styles.sectionHeading}>活跃趋势</h3>
              <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <TrendingUp size={14} className={styles.chartHeaderIcon} />
                    <span>阅读趋势（近30天）</span>
                    <button className={styles.chartExpandBtn} onClick={() => setExpandedChart('reading')} title="放大">
                      <Maximize2 size={14} />
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={historyLineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={6} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={26} />
                      <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }} labelStyle={{ color: 'var(--text-primary)' }} />
                      <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <CalendarCheck size={14} className={styles.chartHeaderIcon} />
                    <span>签到记录（近30天）</span>
                    <button className={styles.chartExpandBtn} onClick={() => setExpandedChart('checkin')} title="放大">
                      <Maximize2 size={14} />
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={checkInLineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={6} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={26} domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v: number) => v === 1 ? '✓' : ''} />
                      <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }} labelStyle={{ color: 'var(--text-primary)' }} formatter={(value: unknown) => value === 1 ? '已签到' : '未签到'} />
                      <Line type="stepAfter" dataKey="checked" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <MessageSquare size={14} className={styles.chartHeaderIcon} />
                    <span>访客留言趋势（近12月）</span>
                    <button className={styles.chartExpandBtn} onClick={() => setExpandedChart('guestbook')} title="放大">
                      <Maximize2 size={14} />
                    </button>
                  </div>
                  {guestbookLineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={guestbookLineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={1} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={26} />
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }} labelStyle={{ color: 'var(--text-primary)' }} />
                        <Line type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#ec4899' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className={styles.chartEmpty}>暂无留言数据</div>
                  )}
                </div>
              </div>
            </div>

            {/* 其他 */}
            <div>
              <h3 className={styles.sectionHeading}>其他</h3>
              <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <Activity size={14} className={styles.chartHeaderIcon} />
                    <span>健康提醒</span>
                    <button className={styles.chartExpandBtn} onClick={() => setExpandedChart('health')} title="放大">
                      <Maximize2 size={14} />
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={healthBarData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" domain={[0, 1]} ticks={[0, 1]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-primary)' }} width={40} />
                      <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }} formatter={(value: unknown) => value === 1 ? '已开启' : '未开启'} />
                      <Bar dataKey="active" radius={[0, 4, 4, 0]} barSize={24}>
                        {healthBarData.map((entry, i) => (
                          <Cell key={i} fill={entry.active ? '#10b981' : 'var(--border)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <PieChart size={14} className={styles.chartHeaderIcon} />
                    <span>文章分类</span>
                    <button className={styles.chartExpandBtn} onClick={() => setExpandedChart('category')} title="放大">
                      <Maximize2 size={14} />
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RePieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={82} paddingAngle={2} dataKey="value">
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <Music size={14} className={styles.chartHeaderIcon} />
                    <span>音乐版权分布</span>
                    <button className={styles.chartExpandBtn} onClick={() => setExpandedChart('music')} title="放大">
                      <Maximize2 size={14} />
                    </button>
                  </div>
                  {musicFeeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <RePieChart>
                        <Pie data={musicFeeData} cx="50%" cy="50%" innerRadius={50} outerRadius={82} paddingAngle={3} dataKey="value">
                          {musicFeeData.map((_, i) => (
                            <Cell key={i} fill={MUSIC_FEE_COLORS[i % MUSIC_FEE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }} />
                      </RePieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className={styles.chartEmpty}>暂无歌曲数据</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className={styles.tabContent}>
            {favoritePosts.length > 0 ? (
              <div className={styles.favGrid}>
                {favoritePosts.map((post) => post && (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <Heart size={48} className={styles.emptyIcon} />
                <p>还没有收藏任何文章</p>
                <p className={styles.emptyHint}>浏览文章时点击收藏按钮即可</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>

    {/* Chart expand modal */}
    {expandedChart &&
      createPortal(
        <div className={styles.chartModal} onClick={closeExpanded}>
          <div className={styles.chartModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.chartModalHeader}>
              <span>{chartTitles[expandedChart] || ''}</span>
              <button className={styles.chartModalClose} onClick={closeExpanded}>
                <X size={18} />
              </button>
            </div>
            {renderExpandedChart(expandedChart)}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
