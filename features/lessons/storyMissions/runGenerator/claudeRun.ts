/**
 * Claude full-run generator - 20 scenes, strict JSON, fallback to mock
 */

import type { StoryRun, StoryRunScene, Ending } from '../storyRunSchema';
import { validateStoryRun } from '../storyRunSchema';
import { getAnthropicApiKey, getClaudeModel } from '../config';
import { GUIDE_STYLE_BIBLES } from '../guideStyleBibles';
import { SAFETY_BANNER_COPY, ALLOWED_CONCEPT_TAGS, FORBIDDEN_TOPICS } from '../storyRunSchema';
import { generateMockRun } from './mockRun';
import type { GuideId } from '../models';

export interface RunGeneratorInput {
  guideId: GuideId;
  seed: number;
  childAgeBand?: '7-9' | '9-12' | 'all';
}

function buildPrompt(input: RunGeneratorInput): string {
  const bible = GUIDE_STYLE_BIBLES[input.guideId];
  const ageBand = input.childAgeBand ?? 'all';

  return `You are generating a FULL 20-scene whimsical adventure for a child (age band: ${ageBand}) in an educational game.

GUIDE: ${input.guideId}
Style Bible:
- Tone: ${bible.tone.join(', ')}
- Props: ${bible.recurringProps.join(', ')}
- NPCs: ${bible.npcCast.join(', ')}
- Catchphrases: ${bible.catchphrases.join(', ')}
- Humor: ${bible.humorStyle}
- Settings: ${bible.settingPalette.join(', ')}

REQUIREMENTS:
- Exactly 20 scenes. Mix: ~10 STORY, ~6 FUN, ~4 EDU. No back-to-back EDU.
- At least 8 meaningful choices total (FUN scenes have 2-4 choices each).
- At least 3 endings: 2 normal + 1 secret (requiredFlags for secret).
- Choices must set flags (setsFlags). Use: choseNebulaPath, choseReefTunnel, gotStarKey, askedSidekick, turtleTrust, helpedNpc, choseHighPath, choseLowPath, etc.
- EDU scenes: embed learning in story (clue, console, map, reef ritual). Concept tags ONLY: ${ALLOWED_CONCEPT_TAGS.join(', ')}.
- EDU: questionInStory, options (exactly 3 strings), correctIndex (0-2), feedbackCorrect, feedbackIncorrect.
- Safety: ${SAFETY_BANNER_COPY}. NO dosing, NO diagnosis/treatment. Choices: tell trusted adult, follow plan, breathe, safe spot only.
- Forbidden: ${FORBIDDEN_TOPICS.join(', ')}.
- Scene next: defaultNextIndex (1-20, use 0 for final scene to mean "end"). Optional branchByFlag: [{flag, nextIndex}].
- Endings: endingId, title, requiredFlags (optional), epilogue (max 1000 chars), rewards: {xp, coins, items?}.

Output valid JSON only (no markdown). One object matching this schema:
{
  "runId": "claude_${input.guideId}_${input.seed}",
  "guideId": "${input.guideId}",
  "seed": ${input.seed},
  "title": "string",
  "synopsis": "string",
  "scenes": [
    {
      "index": 1,
      "id": "s1",
      "kind": "STORY"|"FUN"|"EDU",
      "settingTitle": "string",
      "narration": "string (max 1200 chars)",
      "dialogue": [{"speaker":"string","line":"string"}],
      "visualCue": {"backgroundKey":"string","propKey":"string","moodKey":"string"},
      "choices": [{"id":"string","label":"string","setsFlags":{"flag":true}}],
      "edu": {"conceptTag":"string","questionInStory":"string","options":["a","b","c"],"correctIndex":0,"feedbackCorrect":"string","feedbackIncorrect":"string"},
      "next": {"defaultNextIndex": number}
    }
  ],
  "endings": [
    {"endingId":"string","title":"string","requiredFlags":{"flag":true},"epilogue":"string","rewards":{"xp":number,"coins":number,"items":[]}}
  ],
  "metadata": {"sceneCount":20,"choiceCount":number,"eduCount":4,"endingCount":3}
}

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

export async function generateRunWithClaude(input: RunGeneratorInput): Promise<StoryRun> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) return generateMockRun(input.guideId, input.seed);

  const model = getClaudeModel();

  const body = {
    model,
    max_tokens: 16000,
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
      console.warn('[Claude Run] API error', res.status, await res.text());
      return generateMockRun(input.guideId, input.seed);
    }

    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const block = data.content?.find((c) => c.type === 'text');
    const text = block?.text ?? '';
    const parsed = parseJsonFromResponse(text) as StoryRun;

    if (parsed && validateStoryRun(parsed)) return parsed;

    // Retry once with repair prompt
    const repairBody = {
      ...body,
      messages: [
        { role: 'user', content: buildPrompt(input) },
        { role: 'assistant', content: text },
        {
          role: 'user',
          content:
            'The JSON was invalid. Fix: 20 scenes (STORY/FUN/EDU), no back-to-back EDU, 8+ choices, 3 endings. Output one valid JSON object. No markdown.',
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

    if (!retryRes.ok) return generateMockRun(input.guideId, input.seed);

    const retryData = (await retryRes.json()) as { content?: Array<{ type: string; text?: string }> };
    const retryBlock = retryData.content?.find((c) => c.type === 'text');
    const retryParsed = parseJsonFromResponse(retryBlock?.text ?? '') as StoryRun;

    if (retryParsed && validateStoryRun(retryParsed)) return retryParsed;
  } catch (e) {
    console.warn('[Claude Run] request failed', e);
  }

  return generateMockRun(input.guideId, input.seed);
}
