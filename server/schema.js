/**
 * Care plan JSON schema for Claude parser output.
 * Used in system prompt and for validation.
 */

const CARE_PLAN_SCHEMA = {
  diagnosis: [],
  medications: [
    {
      name: '',
      dose: '',
      frequency: '',
      timing: [],
      type: 'daily | rescue',
      confidence: 'high | medium | low',
      source_quote: '',
    },
  ],
  emergency_rules: [
    {
      rule: '',
      confidence: 'high | medium | low',
      source_quote: '',
    },
  ],
  daily_care_tasks: [],
  restrictions: [],
  followups: [],
};

const EMPTY_CARE_PLAN = () => ({
  diagnosis: [],
  medications: [],
  emergency_rules: [],
  daily_care_tasks: [],
  restrictions: [],
  followups: [],
});

module.exports = { CARE_PLAN_SCHEMA, EMPTY_CARE_PLAN };
