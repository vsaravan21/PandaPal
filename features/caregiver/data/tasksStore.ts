/**
 * Care tasks store - care plan items
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pandapal/care_tasks';

export interface CareTask {
  id: string;
  label: string;
  dueTime?: string; // HH:mm
  completedAt?: string; // ISO
  missed?: boolean;
}

const MOCK_TASKS: CareTask[] = [
  { id: 't1', label: 'Morning medicine', dueTime: '08:00' },
  { id: 't2', label: 'Check-in', dueTime: '12:00' },
  { id: 't3', label: 'Evening routine', dueTime: '20:00' },
];

async function loadTasks(): Promise<CareTask[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [...MOCK_TASKS];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_TASKS;
  } catch {
    return [...MOCK_TASKS];
  }
}

async function saveTasks(tasks: CareTask[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(tasks));
}

export async function getTasks(): Promise<CareTask[]> {
  return loadTasks();
}

export async function completeTask(taskId: string): Promise<void> {
  const tasks = await loadTasks();
  const t = tasks.find((x) => x.id === taskId);
  if (t) {
    t.completedAt = new Date().toISOString();
    t.missed = false;
    await saveTasks(tasks);
  }
}
