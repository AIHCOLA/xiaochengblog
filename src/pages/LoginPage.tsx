import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn } from 'lucide-react';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('请填写邮箱和密码');
      return;
    }

    setLoading(true);
    const success = await login(email.trim(), password);
    setLoading(false);

    if (success) {
      addToast('success', '登录成功！欢迎回来');
      navigate('/');
    } else {
      setError('邮箱或密码错误');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconBox}>
          <LogIn size={28} />
        </div>
        <h1 className={styles.title}>欢迎回来</h1>
        <p className={styles.subtitle}>登录你的账号</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <Input
            label="邮箱"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="密码"
            type="password"
            placeholder="输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submitBtn}>
            登录
          </Button>
        </form>

        <div className={styles.divider}>
          <span>或使用第三方登录</span>
        </div>

        <div className={styles.oauthButtons}>
          <button
            type="button"
            className={styles.oauthBtn}
            onClick={() => { window.location.href = '/api/auth/oauth2/authorize/github'; }}
          >
            GitHub 登录
          </button>
          <button
            type="button"
            className={styles.oauthBtn}
            onClick={() => { window.location.href = '/api/auth/oauth2/authorize/google'; }}
          >
            Google 登录
          </button>
          <button
            type="button"
            className={styles.oauthBtn}
            onClick={() => { window.location.href = '/api/auth/oauth2/authorize/wechat'; }}
          >
            微信登录
          </button>
        </div>

        <p className={styles.switch}>
          还没有账号？{' '}
          <Link to="/register" className={styles.link}>
            立即注册
          </Link>
        </p>

        <p className={styles.hint}>
          演示账号：demo@xiaocheng.dev / demo123
        </p>
      </div>
    </div>
  );
}
