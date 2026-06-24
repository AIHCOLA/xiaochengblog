import client from './client';

export interface PlaylistEntry {
  id?: number;
  songId: number | string;
  title: string;
  artist: string;
  fee: number;
  platform?: string;
  sortOrder?: number;
}

export interface PlaylistEntryWithUrl extends PlaylistEntry {
  src: string;
}

export async function getPlaylist(): Promise<PlaylistEntry[]> {
  return client.get('/music-playlist') as unknown as PlaylistEntry[];
}

export async function savePlaylist(songs: PlaylistEntry[]): Promise<PlaylistEntry[]> {
  return client.put('/music-playlist', { songs }) as unknown as PlaylistEntry[];
}

export async function clearPlaylist(): Promise<void> {
  await client.delete('/music-playlist');
}
