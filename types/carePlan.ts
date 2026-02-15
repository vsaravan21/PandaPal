export type Medication = {
  name: string;
  dose: string;
  frequency: string;
  timing: string[];
  type: 'daily' | 'rescue';
  confidence: 'high' | 'medium' | 'low';
  source_quote?: string;
};

export type EmergencyRule = {
  rule: string;
  confidence: string;
  source_quote?: string;
};

export type FollowUpReminder = 'none' | '1_week' | '2_weeks' | '1_month' | 'custom';

export type FollowUp = {
  description: string;
  suggested_timeframe?: string;
  reminder?: FollowUpReminder;
  create_reminder?: boolean;
};

export type CarePlan = {
  medications?: Medication[];
  daily_care_tasks?: string[] | Array<{ text: string; include?: boolean }>;
  emergency_rules?: EmergencyRule[];
  restrictions?: string[];
  followups?: Array<string | FollowUp>;
  parse_warnings?: string[];
  unreadable_docs_count?: number;
};

export type EditableCarePlan = {
  medications: Medication[];
  daily_care_tasks: string[];
  emergency_rules: EmergencyRule[];
  restrictions: string[];
  followups: FollowUp[];
};
