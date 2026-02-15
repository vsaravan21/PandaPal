/**
 * Tasks store - mock data, designed for real integration later
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pandapal/care_tasks';

export interface CareTask {
  id: string;
  label: string;
  dueTime?: string;
  completedAt?: string;
  missed?: boolean;
}

export async function getTasks(): Promise<CareTask[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return getMockTasks();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getMockTasks();
  } catch {
    return getMockTasks();
  }
}

export async function completeTask(taskId: string): Promise<CareTask[]> {
  const tasks = await getTasks();
  const now = new Date().toISOString();
  const updated = tasks.map((t) =>
    t.id === taskId ? { ...t, completedAt: now, missed: false } : t
  );
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

function getMockTasks(): CareTask[] {
  const today = new Date().toISOString().slice(0, 10);
  return [
    { id: 't1', label: 'Morning medicine', dueTime: '08:00', completedAt: `${today}T08:15:00` },
    { id: 't2', label: 'Check-in', dueTime: '12:00' },
    { id: 't3', label: 'Evening routine', dueTime: '19:00' },
  ];
}
