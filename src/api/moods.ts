import client from './client';

interface MoodEntry {
  date: string;
  emoji: string | null;
  checkedIn: boolean;
}

interface MoodUpsertResponse {
  date: string;
  emoji: string | null;
  checkedIn: boolean;
}

export async function getMoods(year: number, month: number): Promise<MoodEntry[]> {
  return client.get('/moods', { params: { year, month } }) as unknown as MoodEntry[];
}

export async function upsertMood(date: string, emoji?: string | null, checkedIn?: boolean): Promise<MoodUpsertResponse> {
  return client.post('/moods', { date, emoji, checkedIn }) as unknown as MoodUpsertResponse;
}

export async function deleteMood(date: string): Promise<void> {
  await client.delete(`/moods/${date}`);
}
