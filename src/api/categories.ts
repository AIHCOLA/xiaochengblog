import client from './client';
import type { Category } from '../types';

interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
}

function toCategory(r: CategoryResponse): Category {
  return {
    id: String(r.id),
    name: r.name,
    slug: r.slug,
    description: r.description,
    color: r.color,
  };
}

export async function getCategories(): Promise<Category[]> {
  const result = await client.get('/categories') as unknown as CategoryResponse[];
  return result.map(toCategory);
}

export async function createCategory(data: Omit<Category, 'id'>): Promise<Category> {
  const result = await client.post('/categories', data) as unknown as CategoryResponse;
  return toCategory(result);
}
