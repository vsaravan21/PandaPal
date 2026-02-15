/**
 * Symptom/logs store - mock data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pandapal/symptom_logs';

export interface SymptomLog {
  id: string;
  timestamp: string;
  type: string;
  note?: string;
  tags?: string[];
}

export async function getLogs(): Promise<SymptomLog[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return getMockLogs();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getMockLogs();
  } catch {
    return getMockLogs();
  }
}

function getMockLogs(): SymptomLog[] {
  const now = new Date();
  const d = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
  return [
    { id: 'l1', timestamp: d(0), type: 'symptom', note: 'Tired after school', tags: ['sleep'] },
    { id: 'l2', timestamp: d(2), type: 'log', note: 'Routine went well' },
    { id: 'l3', timestamp: d(5), type: 'symptom', tags: ['stress'] },
  ];
}

export async function addLog(log: Omit<SymptomLog, 'id'>): Promise<void> {
  const existing = await getLogs();
  const newLog: SymptomLog = {
    ...log,
    id: `l${Date.now()}`,
  };
  existing.unshift(newLog);
  await AsyncStorage.setItem(KEY, JSON.stringify(existing));
}
