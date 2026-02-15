/**
 * Symptom logs store
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pandapal/symptom_logs';

export interface SymptomLog {
  id: string;
  timestamp: string; // ISO
  type: string;
  note?: string;
  tags?: string[];
}

const MOCK_LOGS: SymptomLog[] = [
  { id: 'l1', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'Seizure', note: 'Brief focal', tags: ['morning'] },
  { id: 'l2', timestamp: new Date(Date.now() - 172800000).toISOString(), type: 'Mood', note: 'Good day', tags: [] },
];

async function loadLogs(): Promise<SymptomLog[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [...MOCK_LOGS];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : MOCK_LOGS;
  } catch {
    return [...MOCK_LOGS];
  }
}

async function saveLogs(logs: SymptomLog[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(logs));
}

export async function getLogs(): Promise<SymptomLog[]> {
  return loadLogs();
}

export async function addLog(log: Omit<SymptomLog, 'id'>): Promise<SymptomLog> {
  const logs = await loadLogs();
  const newLog: SymptomLog = {
    ...log,
    id: `l${Date.now()}`,
    timestamp: log.timestamp || new Date().toISOString(),
  };
  logs.unshift(newLog);
  await saveLogs(logs);
  return newLog;
}
