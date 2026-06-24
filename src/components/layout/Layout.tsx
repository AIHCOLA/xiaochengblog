import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  sidebar?: boolean;
}

export function Layout({ children, sidebar = true }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={`${styles.content} ${sidebar ? styles.withSidebar : ''}`}>
            <div className={styles.primary}>{children}</div>
            {sidebar && <Sidebar />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
