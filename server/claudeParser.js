/**
 * Parse clinical document text with Claude into structured care plan JSON.
 */

const Anthropic = require('@anthropic-ai/sdk');
const { CARE_PLAN_SCHEMA } = require('./schema');

const SCHEMA_JSON = JSON.stringify(CARE_PLAN_SCHEMA, null, 2);

const systemPrompt = `You are a pediatric clinical document parser. Extract structured care plan data from medical documents. Only return valid JSON matching the provided schema. No explanations. No extra text.`;

const userPromptTemplate = (text) => `Parse this pediatric clinical document and extract structured care instructions.

DOCUMENT:
${text}

Return JSON matching this schema exactly:
${SCHEMA_JSON}

Return only the JSON object, no markdown code fences.`;

/**
 * Call Claude messages API and parse response as JSON.
 * @param {string} text - Raw document text
 * @returns {Promise<object>} Parsed care plan object
 */
async function parseWithClaude(text) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const anthropic = new Anthropic({ apiKey });

  const truncated = text.trim().slice(0, 180000);
  const userPrompt = userPromptTemplate(truncated);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    temperature: 0.1,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const block = message.content?.find((b) => b.type === 'text');
  const raw = block?.text?.trim() || '';
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Claude returned invalid JSON: ${e.message}. Raw: ${raw.slice(0, 200)}`);
  }
}

module.exports = { parseWithClaude };
