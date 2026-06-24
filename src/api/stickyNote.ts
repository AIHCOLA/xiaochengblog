import client from './client';

interface StickyNoteData {
  content: string;
  colorIndex: number;
}

export async function get(): Promise<StickyNoteData> {
  return client.get('/sticky-note') as unknown as StickyNoteData;
}

export async function save(data: { content?: string; colorIndex?: number }): Promise<StickyNoteData> {
  return client.put('/sticky-note', data) as unknown as StickyNoteData;
}
