import client from './client';

interface CountdownItem {
  id: number;
  name: string;
  targetDate: string;
  createdAt: string;
}

export async function getCountdowns(): Promise<CountdownItem[]> {
  return client.get('/countdowns') as unknown as CountdownItem[];
}

export async function createCountdown(name: string, targetDate: string): Promise<CountdownItem> {
  return client.post('/countdowns', { name, targetDate }) as unknown as CountdownItem;
}

export async function deleteCountdown(id: number): Promise<void> {
  await client.delete(`/countdowns/${id}`);
}
