import client from './client';

export async function getStates(): Promise<Record<string, boolean>> {
  return client.get('/health-reminders') as unknown as Record<string, boolean>;
}

export async function setState(reminderId: string, active: boolean): Promise<void> {
  await client.put(`/health-reminders/${reminderId}`, { active });
}
