export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  if (months < 12) return `${months} 个月前`;
  return `${years} 年前`;
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const chineseChars = (text.match(/[一-鿿]/g) || []).length;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil((chineseChars + words) / wordsPerMinute));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function getArchiveGroups(posts: { createdAt: string }[]): Map<string, { month: string; count: number }[]> {
  const groups = new Map<string, { month: string; count: number }[]>();

  const sorted = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  for (const post of sorted) {
    const d = new Date(post.createdAt);
    const year = d.getFullYear().toString();
    const month = `${d.getFullYear()}年${d.getMonth() + 1}月`;

    if (!groups.has(year)) {
      groups.set(year, []);
    }
    const months = groups.get(year)!;
    const existing = months.find((m) => m.month === month);
    if (existing) {
      existing.count++;
    } else {
      months.push({ month, count: 1 });
    }
  }

  return groups;
}
