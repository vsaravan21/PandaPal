/**
 * Clinical-to-caregiver translation layer.
 * Post-processes parsed medical document data into caregiver-friendly display text.
 * Medication names are never changed. Only abbreviations, codes, and wording are translated.
 */

const ABBREV_MAP: Record<string, string> = {
  BID: 'twice daily',
  TID: 'three times daily',
  QID: 'four times daily',
  PRN: 'as needed',
  PO: 'by mouth',
  IM: 'injection',
  IV: 'through a vein',
  'q6h': 'every 6 hours',
  'q8h': 'every 8 hours',
  'q12h': 'every 12 hours',
};

function applyAbbrevMap(text: string): string {
  if (!text || !text.trim()) return text;
  let out = text;
  const keys = Object.keys(ABBREV_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const re = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    out = out.replace(re, ABBREV_MAP[key]);
  }
  return out;
}

// --- Medication display (name never changed) ---

export type MedicationInput = {
  name: string;
  dose: string;
  frequency: string;
  timing: string[];
  type: string;
  confidence?: string;
  source_quote?: string;
};

export type CaregiverMedicationView = {
  display_name: string;
  display_dose_primary: string;
  display_dose_secondary: string;
  display_frequency_text: string;
  display_timing_text: string[];
  display_type_label: string;
};

export function buildCaregiverMedicationView(med: MedicationInput): CaregiverMedicationView {
  const name = (med.name ?? '').trim();
  const dose = (med.dose ?? '').trim();
  const frequency = (med.frequency ?? '').trim();
  const timing = Array.isArray(med.timing) ? med.timing : [];
  const type = (med.type ?? 'daily').toLowerCase();

  let display_dose_primary = '';
  let display_dose_secondary = '';

  // mg per kg: hide formula from main display
  const mgPerKgMatch = dose.match(/\d+(?:\.\d+)?\s*mg\s*\/\s*kg/i);
  if (mgPerKgMatch) {
    const computedMatch = dose.match(/(?:equals?|=\s*|→\s*)(\d+(?:\.\d+)?\s*(?:mg|mL|tablet)s?)/i);
    if (computedMatch) {
      display_dose_primary = `Give ${computedMatch[1].trim()}`;
      display_dose_secondary = dose.replace(computedMatch[0], '').trim() || 'Confirm exact amount with clinician.';
    } else {
      display_dose_primary = 'Dose based on weight. Confirm exact amount with clinician.';
      display_dose_secondary = '';
    }
  } else {
    // "300 mg (3 mL)" → Primary: Give 3 mL, Secondary: equals 300 mg
    const mgMlMatch = dose.match(/(\d+(?:\.\d+)?)\s*mg\s*\((\d+(?:\.\d+)?)\s*mL\)/i);
    if (mgMlMatch) {
      display_dose_primary = `Give ${mgMlMatch[2]} mL`;
      display_dose_secondary = `equals ${mgMlMatch[1]} mg`;
    } else if (/^\d+\s*tablet/i.test(dose) || /tablet/i.test(dose)) {
      display_dose_primary = `Give ${dose.trim()}`;
      display_dose_secondary = '';
    } else if (dose) {
      display_dose_primary = dose.startsWith('Give ') ? dose : `Give ${dose}`;
      display_dose_secondary = '';
    }
  }

  let display_frequency_text = applyAbbrevMap(frequency);
  if (display_frequency_text && !/daily|hours|needed|morning|evening|bedtime/i.test(display_frequency_text)) {
    display_frequency_text = display_frequency_text;
  }

  const display_timing_text = timing.map((t) => {
    const lower = (t || '').toLowerCase();
    if (lower === 'morning') return 'Morning';
    if (lower === 'evening') return 'Evening';
    if (lower === 'bedtime' || lower === 'at bedtime') return 'Bedtime';
    return applyAbbrevMap(t || '').trim() || t;
  }).filter(Boolean);

  const display_type_label = type === 'rescue' ? 'Rescue medicine' : 'Daily medicine';

  return {
    display_name: name || 'Unnamed',
    display_dose_primary: display_dose_primary || '—',
    display_dose_secondary: display_dose_secondary || '',
    display_frequency_text: display_frequency_text || '—',
    display_timing_text: display_timing_text.length ? display_timing_text : [],
    display_type_label,
  };
}

// --- Daily care task ---

export function translateTask(text: string): string {
  if (!text || !text.trim()) return text;
  let out = applyAbbrevMap(text);

  const replacements: [RegExp | string, string][] = [
    [/maintain\s+medication\s+adherence/gi, 'Give medicine on schedule'],
    [/continue\s+[\w-]+\s+at\s+current\s+dose/gi, 'Continue as prescribed'],
    [/continue\s+seizure\s+medication\s+as\s+prescribed/gi, 'Continue seizure medicine as prescribed'],
    [/continue\s+levetiracetam\s+at\s+current\s+dose/gi, 'Continue seizure medicine as prescribed'],
    [/continue\s+[\w-]+\s+as\s+(?:prescribed|directed)/gi, 'Continue medicine as prescribed'],
    [/medication\s+adherence/gi, 'Give medicine on schedule'],
    [/administer\s+medication/gi, 'Give medicine'],
    [/administer/gi, 'give'],
    [/as\s+directed\s+by\s+physician/gi, 'as prescribed'],
    [/per\s+MD\s+order/gi, 'as prescribed'],
    [/prn/gi, 'as needed'],
  ];

  for (const [from, to] of replacements) {
    if (typeof from === 'string') out = out.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), to);
    else out = out.replace(from, to);
  }

  out = out.replace(/\s+/g, ' ').trim();
  if (out.length > 120) out = out.slice(0, 117) + '...';
  return out || 'Confirm with your clinician.';
}

// --- Emergency rules: group by action, translate ---

export type GroupedEmergencyBlock = {
  title: string;
  bullets: string[];
};

const EMERGENCY_ACTION_PREFIXES = /^(?:call\s*911|call\s+emergency\s+services|contact\s+emergency)/i;

const emergencyTermMap: [RegExp | string, string][] = [
  [/convulsive\s+seizure/gi, 'strong shaking seizure'],
  [/administer/gi, 'give'],
  [/prn/gi, 'as needed'],
  [/status\s+epilepticus/gi, 'seizure lasting more than 5 minutes'],
  [/respiratory\s+distress/gi, 'trouble breathing'],
  [/loss\s+of\s+consciousness/gi, 'unresponsive'],
];

export function translateEmergencyRuleText(rule: string): string {
  let out = applyAbbrevMap(rule);
  for (const [from, to] of emergencyTermMap) {
    if (typeof from === 'string') out = out.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), to);
    else out = out.replace(from, to);
  }
  return out.replace(/\s+/g, ' ').trim();
}

export function translateAndGroupEmergencyRules(
  rules: Array<{ rule: string }>
): GroupedEmergencyBlock {
  const bullets: string[] = [];
  const other: string[] = [];

  for (const r of rules) {
    const rule = (r.rule ?? '').trim();
    if (!rule) continue;
    const translated = translateEmergencyRuleText(rule);
    if (EMERGENCY_ACTION_PREFIXES.test(rule)) {
      const condition = rule.replace(/^call\s*911\s*(?:if|when|:)?\s*/i, '').replace(/^call\s+emergency[^:]*:\s*/i, '').trim();
      const bullet = condition ? translateEmergencyRuleText(condition) : translated;
      if (bullet && !bullets.some((b) => b.toLowerCase() === bullet.toLowerCase())) bullets.push(bullet);
    } else {
      if (translated && !other.some((o) => o.toLowerCase() === translated.toLowerCase())) other.push(translated);
    }
  }

  const allBullets = bullets.length > 0 ? bullets : other;
  return {
    title: 'When to call emergency services',
    bullets: allBullets.length ? allBullets : [],
  };
}

// --- Restrictions ---

const RESTRICTION_STARTERS = ['Supervise', 'Avoid', 'Use', 'Do not allow', 'Ensure'];

const restrictionPhrases: [RegExp | string, string][] = [
  [/avoid\s+unsupervised\s+heights/gi, 'Do not allow unsupervised climbing'],
  [/water\s+precautions\s+required/gi, 'Supervise closely around water'],
  [/no\s+unsupervised\s+(?:bathing|swimming)/gi, 'Supervise closely around water'],
  [/seizure\s+precautions/gi, 'Supervise during activities that could be unsafe if a seizure happens'],
  [/no\s+driving/gi, 'Do not allow driving until clinician says it is safe'],
  [/height\s+restrictions/gi, 'Do not allow unsupervised climbing'],
];

export function translateRestriction(text: string): string {
  if (!text || !text.trim()) return text;
  let out = applyAbbrevMap(text);

  for (const [from, to] of restrictionPhrases) {
    if (typeof from === 'string') out = out.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), to);
    else out = out.replace(from, to);
  }

  out = out.replace(/\s+/g, ' ').trim();
  const startsWithVerb = RESTRICTION_STARTERS.some((v) => out.startsWith(v));
  if (!startsWithVerb && out.length > 0) {
    const lower = out.toLowerCase();
    if (lower.startsWith('avoid ')) out = 'Avoid ' + out.slice(6);
    else if (lower.startsWith('no ')) out = 'Do not allow ' + out.slice(3);
    else if (lower.startsWith('supervise')) out = 'Supervise ' + out.slice(9);
    else out = 'Ensure ' + out;
  }
  return out || 'Confirm with your clinician.';
}

// --- Follow-up ---

const followupPhrases: [RegExp | string, string][] = [
  [/if\s+clinically\s+indicated/gi, 'If the doctor recommends it'],
  [/f\/u\s+in/gi, 'Follow up in'],
  [/f\/u\s+with/gi, 'Follow up with'],
  [/follow\s*[- ]?up\s+in\s+(\d+\s+to\s+\d+\s+weeks?)/gi, 'Schedule visit in $1'],
  [/(\w+)\s+follow\s*[- ]?up\s+in\s+([^.]+)/gi, 'Schedule $1 visit in $2'],
  [/per\s+MD/gi, 'as recommended by doctor'],
  [/as\s+needed/gi, 'if the doctor recommends it'],
  [/consider\s+/gi, 'You may consider '],
];

export function translateFollowup(text: string): string {
  if (!text || !text.trim()) return text;
  let out = applyAbbrevMap(text);

  for (const [from, to] of followupPhrases) {
    if (typeof from === 'string') out = out.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), to);
    else out = out.replace(from, to);
  }

  if (!/schedule|reminder|visit|follow\s*up|appointment/i.test(out)) {
    out = out.replace(/^(\w+)\s+in\s+/i, 'Schedule $1 in ');
  }
  out = out.replace(/\s+/g, ' ').trim();
  return out || 'Confirm with your clinician.';
}

// --- Pipeline input/output types ---

export type ParsedPlanInput = {
  medications?: MedicationInput[];
  daily_care_tasks?: string[];
  emergency_rules?: Array<{ rule: string }>;
  restrictions?: string[];
  followups?: string[] | Array<{ description?: string }>;
};

export type CaregiverTranslatedPlan = {
  medications: CaregiverMedicationView[];
  daily_care_tasks: string[];
  emergency_procedures: GroupedEmergencyBlock;
  /** Per-rule translated text for list display (e.g. in edit mode). Same order as input rules. */
  emergency_rules_display: string[];
  restrictions: string[];
  followups: string[];
};

/**
 * Run after parsing and normalization, before UI render.
 * Returns caregiver-safe display data. Frontend must render only these fields.
 */
export function translateCarePlanForCaregiver(parsed_plan: ParsedPlanInput): CaregiverTranslatedPlan {
  const medications = (parsed_plan.medications ?? []).map(buildCaregiverMedicationView);

  const rawTasks = (parsed_plan.daily_care_tasks ?? []).map((t) => (typeof t === 'string' ? t : (t as { description?: string }).description ?? '')).filter(Boolean);
  const daily_care_tasks = rawTasks.map(translateTask);

  const emergency_rules = parsed_plan.emergency_rules ?? [];
  const emergency_procedures = translateAndGroupEmergencyRules(emergency_rules);

  const emergency_rules_display = emergency_rules.map((r) => translateEmergencyRuleText(r.rule));

  const rawRestrictions = (parsed_plan.restrictions ?? []).map((r) => (typeof r === 'string' ? r : '')).filter(Boolean);
  const restrictions = rawRestrictions.map(translateRestriction);

  const rawFollowups = (parsed_plan.followups ?? []).map((f) => (typeof f === 'string' ? f : (f as { description?: string }).description ?? '')).filter(Boolean);
  const followups = rawFollowups.map(translateFollowup);

  return {
    medications,
    daily_care_tasks,
    emergency_procedures,
    emergency_rules_display,
    restrictions,
    followups,
  };
}
