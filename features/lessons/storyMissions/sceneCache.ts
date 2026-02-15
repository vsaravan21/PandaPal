/**
 * Scene cache - store generated scenes by stable key (reduce API calls / replay)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = '@pandapal/story_scene_cache_';

function stableKey(parts: Record<string, unknown>): string {
  const str = JSON.stringify(parts, Object.keys(parts).sort());
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

export function getSceneCacheKey(input: {
  guideId: string;
  runSeed: number;
  sceneIndex: number;
  flagsSubset: string;
  targetConceptTag?: string;
  pacingState: { scenesSinceLearning: number; nextLearningIn: number };
}): string {
  return KEY_PREFIX + stableKey(input);
}

export async function getCachedScene(key: string): Promise<unknown | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setCachedScene(key: string, scene: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(scene));
}

const RUN_CACHE_KEY = '@pandapal/story_last_run';

export interface LastRunCache {
  missionId: string;
  guideId: string;
  runSeed: number;
  sceneKeys: string[];
}

export async function getLastRunCache(): Promise<LastRunCache | null> {
  try {
    const raw = await AsyncStorage.getItem(RUN_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setLastRunCache(data: LastRunCache): Promise<void> {
  await AsyncStorage.setItem(RUN_CACHE_KEY, JSON.stringify(data));
}

// --- Full StoryRun cache (guideId + seed) ---

const RUN_CACHE_PREFIX = '@pandapal/story_run_';

function runCacheKey(guideId: string, seed: number): string {
  return `${RUN_CACHE_PREFIX}${guideId}_${seed}`;
}

export async function getCachedRun(guideId: string, seed: number): Promise<unknown | null> {
  try {
    const raw = await AsyncStorage.getItem(runCacheKey(guideId, seed));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setCachedRun(guideId: string, seed: number, run: unknown): Promise<void> {
  await AsyncStorage.setItem(runCacheKey(guideId, seed), JSON.stringify(run));
}
