/**
 * Merge multiple parsed care plans from several documents.
 * Dedupe medications by name, merge timing, collect conflicts.
 */

const { EMPTY_CARE_PLAN } = require('./schema');

function normalizeMedication(med) {
  return {
    name: (med.name || '').trim(),
    dose: (med.dose || '').trim(),
    frequency: (med.frequency || '').trim(),
    timing: Array.isArray(med.timing) ? med.timing.filter(Boolean) : [],
    type: med.type === 'rescue' ? 'rescue' : 'daily',
    confidence: med.confidence || 'medium',
    source_quote: (med.source_quote || '').trim(),
  };
}

function medKey(m) {
  return (m.name || '').toLowerCase().trim();
}

/**
 * Merge medications: dedupe by name, merge timing, collect conflicts.
 */
function mergeMedications(medsArrays) {
  const byKey = new Map();
  const conflicts = [];

  for (const arr of medsArrays) {
    if (!Array.isArray(arr)) continue;
    for (const m of arr) {
      const norm = normalizeMedication(m);
      const key = medKey(norm);
      if (!key) continue;

      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, { ...norm });
        continue;
      }

      const doseDiff = existing.dose !== norm.dose && norm.dose;
      const timingDiff =
        JSON.stringify([...existing.timing].sort()) !==
        JSON.stringify([...norm.timing].sort()) && norm.timing?.length;

      if (doseDiff || timingDiff) {
        conflicts.push({
          field: 'medication',
          name: norm.name,
          message: doseDiff
            ? `Dose differs: "${existing.dose}" vs "${norm.dose}"`
            : `Timing differs for ${norm.name}`,
        });
      }

      if (norm.dose && !existing.dose) existing.dose = norm.dose;
      if (norm.frequency && !existing.frequency) existing.frequency = norm.frequency;
      if (norm.timing?.length) {
        const set = new Set([...(existing.timing || []), ...norm.timing]);
        existing.timing = [...set];
      }
      if (norm.source_quote && !existing.source_quote) existing.source_quote = norm.source_quote;
    }
  }

  return { medications: [...byKey.values()], conflicts };
}

function mergeSimpleArrays(arrays) {
  const set = new Set();
  for (const arr of arrays) {
    if (!Array.isArray(arr)) continue;
    for (const x of arr) {
      const s = typeof x === 'string' ? x.trim() : (x && x.rule ? x.rule.trim() : '');
      if (s) set.add(s);
    }
  }
  return [...set];
}

function mergeEmergencyRules(arrays) {
  const seen = new Map();
  for (const arr of arrays) {
    if (!Array.isArray(arr)) continue;
    for (const r of arr) {
      const rule = (r.rule || r).trim();
      if (!rule) continue;
      const key = rule.slice(0, 80);
      if (!seen.has(key)) seen.set(key, { rule, confidence: r.confidence || 'medium', source_quote: (r.source_quote || '').trim() });
    }
  }
  return [...seen.values()];
}

function mergeFollowups(arrays) {
  const out = [];
  const seen = new Set();
  for (const arr of arrays) {
    if (!Array.isArray(arr)) continue;
    for (const f of arr) {
      const raw = typeof f === 'string' ? f : (f && (f.description != null ? f.description : f));
      const desc = (typeof raw === 'string' ? raw : String(raw || '')).trim();
      if (!desc || seen.has(desc)) continue;
      seen.add(desc);
      const description = typeof f === 'string' ? f : (f && (typeof f.description === 'string' ? f.description : String(f.description || '')));
      const suggested_timeframe = typeof f === 'object' && f ? (f.suggested_timeframe || f.timeframe || '') : '';
      out.push({ description, suggested_timeframe });
    }
  }
  return out;
}

/**
 * Merge multiple care plan objects.
 * @param {object[]} plans - Array of parsed care plan objects
 * @returns {{ care_plan: object, conflicts: object[] }}
 */
function mergeCarePlans(plans) {
  if (!plans?.length) return { care_plan: EMPTY_CARE_PLAN(), conflicts: [] };

  const allConflicts = [];
  const { medications, conflicts: medConflicts } = mergeMedications(plans.map((p) => p.medications));
  allConflicts.push(...medConflicts);

  const care_plan = {
    diagnosis: mergeSimpleArrays(plans.map((p) => p.diagnosis)),
    medications,
    emergency_rules: mergeEmergencyRules(plans.map((p) => p.emergency_rules)),
    daily_care_tasks: mergeSimpleArrays(plans.map((p) => p.daily_care_tasks)),
    restrictions: mergeSimpleArrays(plans.map((p) => p.restrictions)),
    followups: mergeFollowups(plans.map((p) => p.followups)),
  };

  return { care_plan, conflicts: allConflicts };
}

module.exports = { mergeCarePlans, mergeMedications };
