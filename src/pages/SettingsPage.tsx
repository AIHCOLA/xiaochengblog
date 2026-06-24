import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Bell, Mail, MessageCircle, Heart } from 'lucide-react';
import styles from './SettingsPage.module.css';

interface ToggleProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, icon, checked, onChange }: ToggleProps) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleIcon}>{icon}</div>
      <div className={styles.toggleInfo}>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.toggleDesc}>{description}</span>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();

  const [settings, setSettings] = useState({
    emailNotification: true,
    replyNotification: true,
    likeNotification: false,
    marketingEmail: false,
  });

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className={styles.page}>
          <header className={styles.header}>
            <Bell size={22} className={styles.headerIcon} />
            <div>
              <h1 className={styles.title}>通知设置</h1>
              <p className={styles.subtitle}>请先登录后管理设置</p>
            </div>
          </header>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>去登录</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleToggle = (key: keyof typeof settings) => (value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    addToast('success', '设置已更新');
  };

  return (
    <Layout>
      <div className={styles.page}>
        <header className={styles.header}>
          <Bell size={22} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>通知设置</h1>
            <p className={styles.subtitle}>管理你的通知偏好</p>
          </div>
        </header>

        <div className={styles.sections}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Mail size={16} />
              邮件通知
            </h3>
            <ToggleRow
              label="文章更新通知"
              description="当有新文章发布时通过邮件通知"
              icon={<Mail size={16} />}
              checked={settings.emailNotification}
              onChange={handleToggle('emailNotification')}
            />
            <ToggleRow
              label="营销邮件"
              description="接收不定期推送的精选内容和活动信息"
              icon={<Mail size={16} />}
              checked={settings.marketingEmail}
              onChange={handleToggle('marketingEmail')}
            />
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Bell size={16} />
              互动通知
            </h3>
            <ToggleRow
              label="评论回复通知"
              description="有人回复你的评论时通知"
              icon={<MessageCircle size={16} />}
              checked={settings.replyNotification}
              onChange={handleToggle('replyNotification')}
            />
            <ToggleRow
              label="点赞通知"
              description="有人点赞你的评论时通知"
              icon={<Heart size={16} />}
              checked={settings.likeNotification}
              onChange={handleToggle('likeNotification')}
            />
          </div>
        </div>

        <p className={styles.note}>
          * 通知设置在本地存储，仅作为界面演示
        </p>
      </div>
    </Layout>
  );
}
