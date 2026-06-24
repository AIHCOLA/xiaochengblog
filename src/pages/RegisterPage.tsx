import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus } from 'lucide-react';
import styles from './RegisterPage.module.css';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('请填写所有必填字段');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }
    if (password.length < 4) {
      setError('密码至少需要 4 个字符');
      return;
    }

    setLoading(true);
    const success = await register(username.trim(), email.trim(), password);
    setLoading(false);

    if (success) {
      addToast('success', '注册成功！欢迎加入');
      navigate('/');
    } else {
      setError('该邮箱已被注册');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconBox}>
          <UserPlus size={28} />
        </div>
        <h1 className={styles.title}>创建账号</h1>
        <p className={styles.subtitle}>开始你的阅读之旅</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <Input
            label="用户名"
            placeholder="你的昵称"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
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
            placeholder="至少 4 个字符"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="确认密码"
            type="password"
            placeholder="再次输入密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submitBtn}>
            注册
          </Button>
        </form>

        <p className={styles.switch}>
          已有账号？{' '}
          <Link to="/login" className={styles.link}>
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
