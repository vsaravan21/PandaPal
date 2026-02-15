/**
 * Claude scene generator - Anthropic Messages API, strict JSON, validate + fallback
 */

import type { Scene, GenerationInput } from '../sceneSchema';
import { validateScene, SAFETY_BANNER_COPY, ALLOWED_CONCEPT_TAGS, FORBIDDEN_TOPICS } from '../sceneSchema';
import { getAnthropicApiKey, getClaudeModel } from '../config';
import type { SceneGenerator } from './types';
import { mockSceneGenerator } from './mock';

const MAX_NARRATION = 1200;
const MAX_CHOICES = 4;

function buildPrompt(input: GenerationInput): string {
  const {
    guideId,
    childAgeBand,
    sceneIndex,
    currentPlotSummary,
    lastScenes,
    flags,
    conceptMastery,
    pacingState,
    targetConceptTag,
    requestRecap,
  } = input;

  const safety = input.safetyCopy ?? SAFETY_BANNER_COPY;
  const allowed = (input.allowedConceptTags ?? ALLOWED_CONCEPT_TAGS).join(', ');
  const forbidden = (input.forbiddenTopics ?? FORBIDDEN_TOPICS).join(', ');

  let instruction = '';
  if (requestRecap) {
    instruction = `Generate a RECAP scene. type must be "RECAP". Include rewards: { xp: number, coins: number, relics?: string[], endingId?: string }. Summarize what the child learned in story tone. No learning check.`;
  } else if (targetConceptTag && pacingState.scenesSinceLearning >= pacingState.nextLearningIn) {
    instruction = `Generate a LEARNING_CHECK scene. type must be "LEARNING_CHECK". Embed the question in the story (e.g. a clue, console, checklist, map). conceptTag: "${targetConceptTag}". Include learningCheck: { conceptTag, questionInStory, options (2-4), correctIndex (0-based), feedbackCorrect, feedbackIncorrect }. Only safe answers (tell adult, follow plan, breathe, safe spot). conceptTagsTouched: ["${targetConceptTag}"].`;
  } else {
    instruction = `Generate a story scene. type must be one of: "NARRATIVE", "FUN_CHOICE", or "BREATHING_BREAK". Do NOT use LEARNING_CHECK or RECAP. For FUN_CHOICE provide 2-4 choices with id, label, and optional setsFlags. For BREATHING_BREAK include durationSeconds (e.g. 12) and instruction.`;
  }

  return `You are generating a single story scene for a child (age band: ${childAgeBand}) in an educational game. Guide: ${guideId}. Scene index: ${sceneIndex}.

RULES (strict):
- Child-friendly, immersive. No diagnosis, no medication dosing, no treatment advice. Educational only.
- Safety: ${safety}. Every choice must be safe: tell trusted adult, follow seizure action plan, breathing break, move to safe spot. If emergency is mentioned: "Follow your plan / call emergency services if your plan says so."
- Allowed concept tags: ${allowed}. Forbidden: ${forbidden}.
- narration max ${MAX_NARRATION} characters. choices: 2-4 only.
- Output valid JSON only (no markdown, no \`\`\`). One object matching the Scene schema.

Scene schema (output this shape):
{
  "id": "unique_scene_id",
  "guideId": "${guideId}",
  "type": "NARRATIVE" | "FUN_CHOICE" | "LEARNING_CHECK" | "RECAP" | "BREATHING_BREAK",
  "setting": "short setting name",
  "narration": "string",
  "dialogue": [{"speaker": "string", "line": "string"}],
  "choices": [{"id": "string", "label": "string", "setsFlags": {"flag": true}}],
  "learningCheck": { "conceptTag": "string", "questionInStory": "string", "options": ["string"], "correctIndex": 0, "feedbackCorrect": "string", "feedbackIncorrect": "string" },
  "conceptTagsTouched": ["string"],
  "visualCue": {"backgroundKey": "string", "characterPoseKey": "string", "propKey": "string"},
  "rewards": {"xp": number, "coins": number, "relics": ["string"], "endingId": "string"},
  "durationSeconds": number,
  "instruction": "string"
}
Omit optional fields if not used. For RECAP include rewards. For BREATHING_BREAK include durationSeconds and instruction.

${instruction}

Current plot summary: ${currentPlotSummary || 'Just started.'}
Last scenes (for continuity): ${JSON.stringify(lastScenes.slice(-4))}
Flags: ${JSON.stringify(flags)}
Concept mastery: ${JSON.stringify(conceptMastery)}

Respond with exactly one JSON object.`;
}

function parseJsonFromResponse(text: string): unknown {
  const trimmed = text.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}') + 1;
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end));
  } catch {
    return null;
  }
}

export async function generateSceneClaude(input: GenerationInput): Promise<Scene> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    return mockSceneGenerator.generateNextScene(input);
  }

  const model = getClaudeModel();
  const body = {
    model,
    max_tokens: 2048,
    system: 'You output only valid JSON. No markdown, no code fences. One JSON object per response.',
    messages: [{ role: 'user' as const, content: buildPrompt(input) }],
  };

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[Claude] API error', res.status, errText);
      return mockSceneGenerator.generateNextScene(input);
    }

    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const block = data.content?.find((c) => c.type === 'text');
    const text = block?.text ?? '';
    const parsed = parseJsonFromResponse(text);
    if (parsed && validateScene(parsed)) {
      return parsed as Scene;
    }

    // Retry once with repair prompt
    const repairBody = {
      ...body,
      messages: [
        { role: 'user', content: buildPrompt(input) },
        { role: 'assistant', content: text },
        {
          role: 'user',
          content: `The previous response was not valid. Fix it: output only one JSON object with required fields id, guideId, type, setting, narration, conceptTagsTouched (array). narration max ${MAX_NARRATION} chars. No markdown.`,
        },
      ],
    };
    const retryRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(repairBody),
    });
    if (!retryRes.ok) return mockSceneGenerator.generateNextScene(input);
    const retryData = (await retryRes.json()) as { content?: Array<{ type: string; text?: string }> };
    const retryBlock = retryData.content?.find((c) => c.type === 'text');
    const retryParsed = parseJsonFromResponse(retryBlock?.text ?? '');
    if (retryParsed && validateScene(retryParsed)) return retryParsed as Scene;
  } catch (e) {
    console.warn('[Claude] request failed', e);
  }
  return mockSceneGenerator.generateNextScene(input);
}

export const claudeSceneGenerator: SceneGenerator = {
  async generateNextScene(input: GenerationInput): Promise<Scene> {
    return generateSceneClaude(input);
  },
};
