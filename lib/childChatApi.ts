/**
 * Child epilepsy chat API client. Calls POST /api/child-chat, post-processes reply.
 */

import { API_BASE_URL } from '@/constants/api';

const MAX_SENTENCES = 4;
const MAX_LENGTH = 400;

// Simple list of terms to strip or replace with friendlier wording
const JARGON_REPLACEMENTS: [RegExp | string, string][] = [
  [/epilepsy/gi, 'seizures'],
  [/seizure disorder/gi, 'seizures'],
  [/anticonvulsant/gi, 'medicine'],
  [/antiepileptic/gi, 'medicine'],
  [/neurologist/gi, 'doctor'],
  [/EEG/gi, 'brain test'],
  [/aura/gi, 'funny feeling'],
  [/tonic[- ]clonic/gi, 'big'],
  [/absence seizure/gi, 'zoned out'],
  [/medication/gi, 'medicine'],
  [/diagnosis/gi, 'what the doctor found'],
  [/symptom/gi, 'sign'],
  [/trigger/gi, 'thing that can start it'],
];

function truncateToSentences(text: string, max: number): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  const sentences = trimmed.split(/(?<=[.!?])\s+/);
  if (sentences.length <= max) return trimmed;
  return sentences.slice(0, max).join(' ').trim();
}

function stripJargon(text: string): string {
  let out = text;
  for (const [pattern, replacement] of JARGON_REPLACEMENTS) {
    if (typeof pattern === 'string') {
      out = out.split(pattern).join(replacement);
    } else {
      out = out.replace(pattern, replacement);
    }
  }
  return out;
}

/**
 * Post-process: max 4 sentences, strip jargon, truncate to 400 chars.
 */
export function postProcessReply(raw: string): string {
  let text = raw.trim();
  if (!text) return text;
  text = stripJargon(text);
  text = truncateToSentences(text, MAX_SENTENCES);
  if (text.length > MAX_LENGTH) {
    text = text.slice(0, MAX_LENGTH).trim();
    const lastPeriod = text.lastIndexOf('.');
    if (lastPeriod > MAX_LENGTH * 0.5) text = text.slice(0, lastPeriod + 1);
  }
  return text;
}

export interface ChildChatResponse {
  reply: string;
}

/**
 * Call POST /api/child-chat. Returns post-processed reply text.
 */
export async function fetchChildChatReply(
  message: string,
  childId: string | null
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/child-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message.trim(), childId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const reply = (data as { reply?: string }).reply;
    if (reply) return postProcessReply(reply);
    throw new Error('Chat failed');
  }

  const data = (await res.json()) as ChildChatResponse;
  const raw = data.reply ?? '';
  return postProcessReply(raw);
}
