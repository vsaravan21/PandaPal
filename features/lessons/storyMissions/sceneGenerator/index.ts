/**
 * Scene generator - resolve mock vs live (Claude) from config
 */

import { getAIMode } from '../config';
import type { SceneGenerator } from './types';
import { mockSceneGenerator } from './mock';
import { claudeSceneGenerator } from './claude';

let _generator: SceneGenerator | null = null;

export function getSceneGenerator(): SceneGenerator {
  if (_generator) return _generator;
  _generator = getAIMode() === 'live' ? claudeSceneGenerator : mockSceneGenerator;
  return _generator;
}

export { mockSceneGenerator } from './mock';
export { generateSceneClaude } from './claude';
export type { SceneGenerator } from './types';
