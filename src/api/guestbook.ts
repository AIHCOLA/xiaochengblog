import client from './client';
import type { GuestbookEntry } from '../types';

interface GuestbookEntryResponse {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

function toEntry(r: GuestbookEntryResponse): GuestbookEntry {
  return {
    id: String(r.id),
    author: r.author,
    content: r.content,
    createdAt: r.createdAt,
  };
}

export async function getEntries(): Promise<GuestbookEntry[]> {
  const result = await client.get('/guestbook') as unknown as GuestbookEntryResponse[];
  return result.map(toEntry);
}

export async function addEntry(data: { author: string; content: string }): Promise<GuestbookEntry> {
  const result = await client.post('/guestbook', data) as unknown as GuestbookEntryResponse;
  return toEntry(result);
}

export async function deleteEntry(entryId: string): Promise<void> {
  await client.delete(`/guestbook/${entryId}`);
}
