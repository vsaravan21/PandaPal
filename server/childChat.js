/**
 * Child-safe epilepsy chatbot. Claude Haiku, low token usage, safety precheck.
 */

const Anthropic = require('@anthropic-ai/sdk');

const EMERGENCY_KEYWORDS = [
  "can't breathe",
  'not breathing',
  "won't stop",
  'bleeding',
  'emergency',
  'dying',
];
const SAFETY_RESPONSE = 'Please get a grown up right now so they can help.';
const MAX_CALLS_PER_DAY = 25;
const LIMIT_RESPONSE = "Let's ask a grown up more questions later.";

const SYSTEM_PROMPT = `You are a kind helper explaining epilepsy to a young child. Use simple words and short sentences. Be calm and reassuring. No medical jargon. No medicine changes. Tell them to ask a grown up for medical decisions. Keep answers under 5 sentences.`;

// In-memory: childId -> { date: 'YYYY-MM-DD', count: number }
const dailyCounts = new Map();

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function isOverLimit(childId) {
  if (!childId) return false;
  const key = getTodayKey();
  const entry = dailyCounts.get(childId);
  if (!entry) return false;
  if (entry.date !== key) return false;
  return entry.count >= MAX_CALLS_PER_DAY;
}

function incrementCount(childId) {
  if (!childId) return;
  const key = getTodayKey();
  const entry = dailyCounts.get(childId) || { date: key, count: 0 };
  if (entry.date !== key) {
    entry.date = key;
    entry.count = 0;
  }
  entry.count += 1;
  dailyCounts.set(childId, entry);
}

function runSafetyPrecheck(message) {
  const lower = (message || '').toLowerCase().trim();
  for (const kw of EMERGENCY_KEYWORDS) {
    if (lower.includes(kw)) return true;
  }
  return false;
}

async function callClaudeHaiku(userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 120,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const block = message.content?.find((b) => b.type === 'text');
  return (block?.text?.trim() || '').trim();
}

/**
 * POST /api/child-chat
 * Body: { message: string, childId?: string }
 * Returns: { reply: string }
 */
async function handleChildChat(req, res) {
  try {
    const body = req.body || {};
    const userMessage = typeof body.message === 'string' ? body.message.trim() : '';
    const childId = typeof body.childId === 'string' ? body.childId : null;

    if (!userMessage) {
      return res.status(400).json({ error: 'Missing message' });
    }

    if (isOverLimit(childId)) {
      return res.json({ reply: LIMIT_RESPONSE });
    }

    if (runSafetyPrecheck(userMessage)) {
      return res.json({ reply: SAFETY_RESPONSE });
    }

    const rawReply = await callClaudeHaiku(userMessage);
    incrementCount(childId);

    res.json({ reply: rawReply });
  } catch (err) {
    console.error('Child chat error:', err);
    res.status(500).json({
      error: 'Chat failed',
      reply: "Something went wrong. Let's try again or ask a grown up.",
    });
  }
}

module.exports = { handleChildChat };
