/**
 * Story Missions persistence - AsyncStorage (React Native)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorySession, StoryRunHistory } from './models';
import type { GuideId } from './models';
import type { SceneRunState } from './sceneRunState';

const KEY_GUIDE = '@pandapal/story_guide';
const KEY_MASTERY = '@pandapal/story_concept_mastery';
const KEY_SESSION = '@pandapal/story_session';
const KEY_HISTORY = '@pandapal/story_history';

export async function getSelectedGuide(): Promise<GuideId | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_GUIDE);
    return raw as GuideId | null;
  } catch {
    return null;
  }
}

export async function setSelectedGuide(guideId: GuideId): Promise<void> {
  await AsyncStorage.setItem(KEY_GUIDE, guideId);
}

export async function getConceptMastery(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(KEY_MASTERY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function saveConceptMastery(mastery: Record<string, number>): Promise<void> {
  await AsyncStorage.setItem(KEY_MASTERY, JSON.stringify(mastery));
}

export async function getSession(missionId: string): Promise<StorySession | null> {
  try {
    const raw = await AsyncStorage.getItem(`${KEY_SESSION}_${missionId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveSession(session: StorySession): Promise<void> {
  await AsyncStorage.setItem(`${KEY_SESSION}_${session.missionId}`, JSON.stringify(session));
}

export async function clearSession(missionId: string): Promise<void> {
  await AsyncStorage.removeItem(`${KEY_SESSION}_${missionId}`);
}

export async function getRunHistory(missionId: string): Promise<StoryRunHistory | null> {
  try {
    const raw = await AsyncStorage.getItem(`${KEY_HISTORY}_${missionId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveRunHistory(history: StoryRunHistory): Promise<void> {
  await AsyncStorage.setItem(`${KEY_HISTORY}_${history.missionId}`, JSON.stringify(history));
}

export async function recordRunComplete(
  missionId: string,
  endingId: string | undefined,
  choicesMade: string[]
): Promise<void> {
  const existing = await getRunHistory(missionId);
  const next: StoryRunHistory = {
    missionId,
    runsCompleted: (existing?.runsCompleted ?? 0) + 1,
    endingsUnlocked: existing?.endingsUnlocked ?? [],
    choicesCounts: { ...existing?.choicesCounts },
  };
  if (endingId && !next.endingsUnlocked.includes(endingId)) {
    next.endingsUnlocked.push(endingId);
  }
  for (const c of choicesMade) {
    next.choicesCounts[c] = (next.choicesCounts[c] ?? 0) + 1;
  }
  await saveRunHistory(next);
}

// --- Scene-driven run state (generated stories) ---

const KEY_SCENE_RUN = '@pandapal/story_scene_run';

export async function getSceneRunState(missionId: string): Promise<SceneRunState | null> {
  try {
    const raw = await AsyncStorage.getItem(`${KEY_SCENE_RUN}_${missionId}`);
    if (!raw) return null;
    return JSON.parse(raw) as SceneRunState;
  } catch {
    return null;
  }
}

export async function saveSceneRunState(state: SceneRunState): Promise<void> {
  await AsyncStorage.setItem(`${KEY_SCENE_RUN}_${state.missionId}`, JSON.stringify(state));
}

export async function clearSceneRunState(missionId: string): Promise<void> {
  await AsyncStorage.removeItem(`${KEY_SCENE_RUN}_${missionId}`);
}

// --- Full 20-scene Story Run state ---

const KEY_STORY_RUN_STATE = '@pandapal/story_run_state';

export interface StoryRunPlayerStatePersisted {
  run: unknown;
  currentSceneIndex: number;
  flags: Record<string, boolean>;
  conceptMastery: Record<string, number>;
}

export async function getStoryRunPlayerState(missionId: string): Promise<StoryRunPlayerStatePersisted | null> {
  try {
    const raw = await AsyncStorage.getItem(`${KEY_STORY_RUN_STATE}_${missionId}`);
    if (!raw) return null;
    return JSON.parse(raw) as StoryRunPlayerStatePersisted;
  } catch {
    return null;
  }
}

export async function saveStoryRunPlayerState(
  missionId: string,
  state: StoryRunPlayerStatePersisted
): Promise<void> {
  await AsyncStorage.setItem(`${KEY_STORY_RUN_STATE}_${missionId}`, JSON.stringify(state));
}

export async function clearStoryRunPlayerState(missionId: string): Promise<void> {
  await AsyncStorage.removeItem(`${KEY_STORY_RUN_STATE}_${missionId}`);
}
