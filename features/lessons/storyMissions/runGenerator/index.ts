/**
 * Run generator - mock (default) or Claude
 */

import { getAIMode } from '../config';
import { generateMockRun } from './mockRun';
import { generateRunWithClaude } from './claudeRun';
import type { StoryRun } from '../storyRunSchema';
import type { GuideId } from '../models';

export interface RunGeneratorInput {
  guideId: GuideId;
  seed: number;
  childAgeBand?: '7-9' | '9-12' | 'all';
}

export async function generateRun(input: RunGeneratorInput): Promise<StoryRun> {
  if (getAIMode() === 'live') {
    return generateRunWithClaude(input);
  }
  return generateMockRun(input.guideId, input.seed);
}

export { generateMockRun } from './mockRun';
