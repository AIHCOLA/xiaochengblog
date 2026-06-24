import client from './client';

export type MusicPlatform = 'ncm' | 'qq' | 'kugou' | 'qishui';

export interface SongResult {
  id: number | string;
  name: string;
  artists: { id: number; name: string }[];
  album: { id: number; name: string; picUrl?: string };
  duration: number;
  fee: number;
}

export function feeLabel(fee: number): { text: string; cls: string } {
  switch (fee) {
    case 0: return { text: '免费', cls: 'feeFree' };
    case 1: return { text: 'VIP', cls: 'feeVip' };
    case 4: return { text: '付费', cls: 'feePaid' };
    default: return { text: '限免', cls: 'feeLimited' };
  }
}

export interface SongUrl {
  id: number | string;
  url: string;
  type: string;
}

interface NcmSearchRes {
  code: number;
  result?: {
    songs?: SongResult[];
  };
}

interface NcmUrlRes {
  code: number;
  data?: SongUrl[];
}

export async function searchSongs(
  keyword: string,
  limit = 30,
  platform: MusicPlatform = 'ncm',
): Promise<SongResult[]> {
  const res = await client.get('/music/search', {
    params: { keywords: keyword, limit, type: 1, platform },
  }) as unknown as NcmSearchRes;
  return res?.result?.songs || [];
}

export interface LyricLine {
  time: number; // seconds
  text: string;
}

interface NcmLyricRes {
  code: number;
  lrc?: { lyric?: string };
}

export function parseLrc(lrcStr: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const re = /\[(\d{2}):(\d{2})[.:](\d{2,3})\](.*)/g;
  let match;
  while ((match = re.exec(lrcStr)) !== null) {
    const min = parseInt(match[1], 10);
    const sec = parseInt(match[2], 10);
    const ms = parseInt(match[3].padEnd(3, '0'), 10) / 1000;
    const text = match[4].trim();
    if (text) {
      lines.push({ time: min * 60 + sec + ms, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

export async function getLyric(songId: number | string, platform: MusicPlatform = 'ncm'): Promise<LyricLine[]> {
  const res = await client.get('/music/lyric', {
    params: { id: songId, platform },
  }) as unknown as NcmLyricRes;
  const raw = res?.lrc?.lyric || '';
  return parseLrc(raw);
}

export async function getSongUrls(ids: (number | string)[], platform: MusicPlatform = 'ncm'): Promise<SongUrl[]> {
  const res = await client.get('/music/song/url/v1', {
    params: { id: ids.join(','), level: 'standard', platform },
  }) as unknown as NcmUrlRes;
  return res?.data || [];
}
