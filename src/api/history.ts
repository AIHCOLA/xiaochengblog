import client from './client';
import type { ReadingHistoryEntry } from '../types';

interface HistoryResponse {
  postId: number;
  postTitle: string;
  postSlug: string;
  readAt: string;
}

function toEntry(r: HistoryResponse): ReadingHistoryEntry {
  return {
    postId: String(r.postId),
    postTitle: r.postTitle,
    postSlug: r.postSlug,
    readAt: r.readAt,
  };
}

export async function getHistory(): Promise<ReadingHistoryEntry[]> {
  const result = await client.get('/history') as unknown as HistoryResponse[];
  return result.map(toEntry);
}

export async function addToHistory(postId: string): Promise<void> {
  await client.post(`/history/${postId}`);
}

export async function clearHistory(): Promise<void> {
  await client.delete('/history');
}
