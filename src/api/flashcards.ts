import client from './client';

export async function getKnownWordIds(): Promise<number[]> {
  return client.get('/flashcards/known') as unknown as number[];
}

export async function markKnown(wordId: number): Promise<void> {
  await client.post(`/flashcards/known/${wordId}`);
}

export async function markUnknown(wordId: number): Promise<void> {
  await client.delete(`/flashcards/known/${wordId}`);
}
