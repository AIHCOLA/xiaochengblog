import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './LoginPage.module.css';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (accessToken && refreshToken) {
      handleOAuthCallback(accessToken, refreshToken)
        .then(() => {
          addToast('success', '登录成功！欢迎回来');
          navigate('/', { replace: true });
        })
        .catch(() => {
          setError('登录失败，请重试');
        });
    } else {
      setError('缺少登录凭证');
    }
  }, [searchParams, navigate, handleOAuthCallback, addToast]);

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <h2 className={styles.title}>登录失败</h2>
          <p className={styles.subtitle}>{error}</p>
          <Link to="/login" className={styles.link}>返回登录</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ textAlign: 'center' }}>
        <p>正在登录中...</p>
      </div>
    </div>
  );
}
