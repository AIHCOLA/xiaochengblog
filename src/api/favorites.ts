import client from './client';

interface FavoritePostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  createdAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
}

export async function getFavorites(): Promise<FavoritePostSummary[]> {
  return client.get('/favorites') as unknown as FavoritePostSummary[];
}

export async function addFavorite(postId: string): Promise<void> {
  await client.post(`/favorites/${postId}`);
}

export async function removeFavorite(postId: string): Promise<void> {
  await client.delete(`/favorites/${postId}`);
}
