import type { Habit } from '@/types/habit';

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.error || response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function fetchHabitsFromApi(): Promise<Habit[]> {
  const response = await fetch('/api/habits');
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function createHabitInApi(habit: Habit): Promise<void> {
  const response = await fetch('/api/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(habit),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function updateHabitInApi(id: string, completedDates: string[]): Promise<void> {
  const response = await fetch(`/api/habits/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completedDates }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function deleteHabitInApi(id: string): Promise<void> {
  const response = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}
