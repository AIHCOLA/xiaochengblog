import client from './client';
import type { Tag } from '../types';

interface TagResponse {
  id: number;
  name: string;
  slug: string;
}

function toTag(r: TagResponse): Tag {
  return {
    id: String(r.id),
    name: r.name,
    slug: r.slug,
  };
}

export async function getTags(): Promise<Tag[]> {
  const result = await client.get('/tags') as unknown as TagResponse[];
  return result.map(toTag);
}

export async function createTag(data: Omit<Tag, 'id'>): Promise<Tag> {
  const result = await client.post('/tags', data) as unknown as TagResponse;
  return toTag(result);
}
