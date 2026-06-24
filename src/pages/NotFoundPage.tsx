import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Home, ArrowLeft } from 'lucide-react';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <Layout sidebar={false}>
      <div className={styles.page}>
        <div className={styles.code}>404</div>
        <div className={styles.glow} />
        <h1 className={styles.title}>页面不存在</h1>
        <p className={styles.desc}>
          你访问的页面可能已被移动、删除，或者链接地址有误。
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.homeBtn}>
            <Home size={16} />
            返回首页
          </Link>
          <button className={styles.backBtn} onClick={() => window.history.back()}>
            <ArrowLeft size={16} />
            返回上页
          </button>
        </div>
      </div>
    </Layout>
  );
}
