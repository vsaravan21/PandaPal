/**
 * Scene generator interface
 */

import type { Scene } from '../sceneSchema';
import type { GenerationInput } from '../sceneSchema';

export interface SceneGenerator {
  generateNextScene(input: GenerationInput): Promise<Scene>;
}
