import client from './client';

interface TodoItem {
  id: number;
  text: string;
  done: boolean;
  sortOrder: number;
  createdAt: string;
}

export async function getTodos(): Promise<TodoItem[]> {
  return client.get('/todos') as unknown as TodoItem[];
}

export async function createTodo(text: string): Promise<TodoItem> {
  return client.post('/todos', { text }) as unknown as TodoItem;
}

export async function updateTodo(id: number, data: { text?: string; done?: boolean }): Promise<TodoItem> {
  return client.put(`/todos/${id}`, data) as unknown as TodoItem;
}

export async function deleteTodo(id: number): Promise<void> {
  await client.delete(`/todos/${id}`);
}
