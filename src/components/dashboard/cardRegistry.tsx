import type { ReactNode } from 'react';
import {
  CalendarHeart, Disc3, CloudSun, Search, BarChart3, Timer,
  StickyNote, Link2, Shuffle, Clock, Quote, Hash, Cat, Heart,
  ListChecks, AlarmClock, Activity, BookOpen, Bot,
} from 'lucide-react';

export interface CardDef {
  id: string;
  name: string;
  icon: ReactNode;
  defaultVisible: boolean;
}

export const ALL_CARDS: CardDef[] = [
  {
    id: 'mood-calendar',
    name: '每日心情',
    icon: <CalendarHeart size={18} />,
    defaultVisible: true,
  },
  {
    id: 'pomodoro',
    name: '番茄钟',
    icon: <Timer size={18} />,
    defaultVisible: false,
  },
  {
    id: 'blog-stats',
    name: '博客统计',
    icon: <BarChart3 size={18} />,
    defaultVisible: true,
  },
  {
    id: 'vinyl-player',
    name: '黑胶唱片',
    icon: <Disc3 size={18} />,
    defaultVisible: true,
  },
  {
    id: 'weather',
    name: '今日天气',
    icon: <CloudSun size={18} />,
    defaultVisible: true,
  },
  {
    id: 'search',
    name: 'Bing 搜索',
    icon: <Search size={18} />,
    defaultVisible: true,
  },
  {
    id: 'sticky-note',
    name: '简易便签',
    icon: <StickyNote size={18} />,
    defaultVisible: false,
  },
  {
    id: 'quick-links',
    name: '快捷链接',
    icon: <Link2 size={18} />,
    defaultVisible: false,
  },
  {
    id: 'random-article',
    name: '随机文章',
    icon: <Shuffle size={18} />,
    defaultVisible: false,
  },
  {
    id: 'site-uptime',
    name: '运行时间',
    icon: <Clock size={18} />,
    defaultVisible: false,
  },
  {
    id: 'daily-quote',
    name: '每日一言',
    icon: <Quote size={18} />,
    defaultVisible: false,
  },
  {
    id: 'contribution-heatmap',
    name: '活跃记录',
    icon: <Hash size={18} />,
    defaultVisible: false,
  },
  {
    id: 'desktop-pet',
    name: '月薪喵',
    icon: <Cat size={18} />,
    defaultVisible: false,
  },
  {
    id: 'desktop-girl',
    name: '桌面女友',
    icon: <Heart size={18} />,
    defaultVisible: false,
  },
  {
    id: 'todo-list',
    name: '待办清单',
    icon: <ListChecks size={18} />,
    defaultVisible: false,
  },
  {
    id: 'countdown',
    name: '倒计时',
    icon: <AlarmClock size={18} />,
    defaultVisible: false,
  },
  {
    id: 'health-reminder',
    name: '健康提醒',
    icon: <Activity size={18} />,
    defaultVisible: false,
  },
  {
    id: 'flashcard',
    name: '单词闪卡',
    icon: <BookOpen size={18} />,
    defaultVisible: false,
  },
  {
    id: 'ai-chat',
    name: 'AI助手',
    icon: <Bot size={18} />,
    defaultVisible: false,
  },
];
