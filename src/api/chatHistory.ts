import client from './client';

interface ChatMessage {
  id: number;
  role: string;
  content: string;
  timestamp: string;
}

export async function getHistory(): Promise<ChatMessage[]> {
  return client.get('/chat/history') as unknown as ChatMessage[];
}

export async function saveMessage(role: string, content: string): Promise<ChatMessage> {
  return client.post('/chat/history', { role, content }) as unknown as ChatMessage;
}

export async function clearHistory(): Promise<void> {
  await client.delete('/chat/history');
}
