import { Layout } from '../components/layout/Layout';
import { Guestbook } from '../components/interaction/Guestbook';
import { PageHeader } from '../components/ui/PageHeader';
import { MessageSquare } from 'lucide-react';
import styles from './GuestbookPage.module.css';

export function GuestbookPage() {
  return (
    <Layout>
      <div className={styles.page}>
        <PageHeader
          icon={<MessageSquare size={22} />}
          title="留言板"
          subtitle="欢迎留下你的足迹，说说你想说的"
        />
        <Guestbook />
      </div>
    </Layout>
  );
}
