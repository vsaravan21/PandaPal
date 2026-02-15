/**
 * Child quest generation from caregiver care plan.
 * Uses only medications (daily), daily_care_tasks, and restrictions.
 * Never uses emergency_procedures, followups, or rescue instructions.
 */

export type QuestSchedule = 'morning' | 'evening' | 'daily';
export type QuestType = 'medication' | 'routine' | 'safety';

export interface ChildQuest {
  id: string;
  text: string;
  type: QuestType;
  reward: number;
  schedule: QuestSchedule;
  completed: boolean;
}

/** Care plan shape from onboarding (translated caregiver data). */
export interface CarePlanForQuests {
  medications?: Array<{
    name?: string;
    timing?: string[];
    type?: string;
  }>;
  daily_care_tasks?: string[];
  restrictions?: string[];
}

const SCHEDULE_ORDER: QuestSchedule[] = ['morning', 'daily', 'evening'];
const ID_PREFIX = 'q_';
let idCounter = 0;

function nextId(): string {
  idCounter += 1;
  return `${ID_PREFIX}${idCounter}_${Date.now()}`;
}

/** Normalize timing string to morning | evening | daily */
function normalizeSchedule(timing: string): QuestSchedule {
  const t = (timing || '').toLowerCase().trim();
  if (/morning|am|wake|breakfast/.test(t)) return 'morning';
  if (/evening|night|pm|bedtime|dinner/.test(t)) return 'evening';
  return 'daily';
}

/** Convert daily care task to short child-friendly text (max 60 chars). */
function toRoutineText(task: string): string {
  const trimmed = (task || '').trim();
  const lower = trimmed.toLowerCase();
  // Common mappings
  if (/sleep|bed|rest/.test(lower)) return 'Go to bed on time';
  if (/medicine|medication|meds/.test(lower)) return 'Take your medicine';
  if (/brush|teeth/.test(lower)) return 'Brush your teeth';
  if (/wash|bath|shower/.test(lower)) return 'Wash up';
  if (/eat|meal|food/.test(lower)) return 'Eat your meals';
  if (/exercise|activity|move/.test(lower)) return 'Get some activity';
  if (/water|drink|hydrat/.test(lower)) return 'Drink water';
  if (/routine|schedule/.test(lower)) return 'Follow your routine';
  // Default: shorten and cap
  const shortened = trimmed.length > 60 ? trimmed.slice(0, 57) + '...' : trimmed;
  return shortened || 'Do your daily task';
}

/** Convert restriction to positive safety behavior. */
function toSafetyText(restriction: string): string {
  const trimmed = (restriction || '').trim();
  const lower = trimmed.toLowerCase();
  if (/helmet|bike|cycling/.test(lower)) return 'Wear your helmet';
  if (/water|swim|pool|supervis/.test(lower)) return 'Ask an adult before swimming';
  if (/climb|height/.test(lower)) return 'Stay safe when climbing';
  if (/sunscreen|sun/.test(lower)) return 'Wear sunscreen';
  if (/seatbelt|car/.test(lower)) return 'Wear your seatbelt';
  if (/stranger/.test(lower)) return 'Stay with a trusted adult';
  // Default: positive framing
  if (trimmed.length > 50) return trimmed.slice(0, 47) + '...';
  return trimmed || 'Stay safe';
}

/**
 * Generate child quests from care plan.
 * Only uses medications (daily only), daily_care_tasks, restrictions.
 */
export function generateChildQuests(carePlan: CarePlanForQuests | null | undefined): ChildQuest[] {
  const quests: ChildQuest[] = [];
  if (!carePlan) return quests;

  // Medications: only daily type; one quest per distinct timing across all daily meds
  const medications = carePlan.medications || [];
  const medSchedules = new Set<QuestSchedule>();
  for (const med of medications) {
    if ((med.type || '').toLowerCase() === 'rescue') continue;
    const rawTimings = Array.isArray(med.timing) ? med.timing : [];
    if (rawTimings.length > 0) {
      for (const t of rawTimings) medSchedules.add(normalizeSchedule(t));
    } else {
      medSchedules.add('daily');
    }
  }
  if (medSchedules.size === 0 && medications.some((m) => (m.type || '').toLowerCase() !== 'rescue')) {
    medSchedules.add('daily');
  }
  for (const schedule of medSchedules) {
    const text = schedule === 'morning'
      ? 'Take your morning medicine'
      : schedule === 'evening'
        ? 'Take your evening medicine'
        : 'Take your medicine';
    quests.push({
      id: nextId(),
      text,
      type: 'medication',
      reward: 10,
      schedule,
      completed: false,
    });
  }

  // Daily care tasks → routine quests
  const tasks = carePlan.daily_care_tasks || [];
  const seenTasks = new Set<string>();
  for (const task of tasks) {
    const text = toRoutineText(task);
    const key = text.toLowerCase();
    if (seenTasks.has(key)) continue;
    seenTasks.add(key);
    quests.push({
      id: nextId(),
      text: text.length > 60 ? text.slice(0, 57) + '...' : text,
      type: 'routine',
      reward: 5,
      schedule: 'daily',
      completed: false,
    });
  }

  // Restrictions → safety quests
  const restrictions = carePlan.restrictions || [];
  const seenRest = new Set<string>();
  for (const r of restrictions) {
    const text = toSafetyText(r);
    const key = text.toLowerCase();
    if (seenRest.has(key)) continue;
    seenRest.add(key);
    quests.push({
      id: nextId(),
      text,
      type: 'safety',
      reward: 8,
      schedule: 'daily',
      completed: false,
    });
  }

  // Sort: morning, then daily, then evening
  const order = (s: QuestSchedule) => SCHEDULE_ORDER.indexOf(s);
  quests.sort((a, b) => order(a.schedule) - order(b.schedule));

  return quests;
}
