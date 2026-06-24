import client from './client';

interface QuickLinkItem {
  id: number;
  name: string;
  url: string;
  icon: string;
  sortOrder: number;
}

export async function getAll(): Promise<QuickLinkItem[]> {
  return client.get('/quick-links') as unknown as QuickLinkItem[];
}

export async function create(data: { name: string; url: string; icon: string }): Promise<QuickLinkItem> {
  return client.post('/quick-links', data) as unknown as QuickLinkItem;
}

export async function update(id: number, data: { name?: string; url?: string; icon?: string }): Promise<QuickLinkItem> {
  return client.put(`/quick-links/${id}`, data) as unknown as QuickLinkItem;
}

export async function remove(id: number): Promise<void> {
  await client.delete(`/quick-links/${id}`);
}
