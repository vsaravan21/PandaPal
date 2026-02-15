import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
  PanResponder,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { CarePlan, EditableCarePlan, Medication, EmergencyRule, FollowUp } from '@/types/carePlan';
import { SectionCard } from '@/components/review/SectionCard';
import { EditTaskBottomSheet } from '@/components/review/EditTaskBottomSheet';
import { API_BASE_URL } from '@/constants/api';
import { generateChildQuests } from '@/lib/questGenerator';
import { setQuests } from '@/lib/questStore';

/** Normalize and apply parsing rules: dedupe medications, merge emergency rules by action (e.g. Call 911), merge repetitive tasks. */
function normalizeApiPlan(plan: CarePlan): EditableCarePlan {
  const rawMeds = (plan.medications || []).map((m) => ({
    name: m.name ?? '',
    dose: m.dose ?? '',
    frequency: m.frequency ?? '',
    timing: Array.isArray(m.timing) ? m.timing : [],
    type: (m.type === 'rescue' ? 'rescue' : 'daily') as 'daily' | 'rescue',
    confidence: (m.confidence as 'high' | 'medium' | 'low') || 'medium',
    source_quote: m.source_quote ?? '',
  }));
  // Remove duplicate medication entries by name (case-insensitive; keep first)
  const seenMedNames = new Set<string>();
  const medications = rawMeds.filter((m) => {
    const key = (m.name || '').trim().toLowerCase();
    if (!key || seenMedNames.has(key)) return false;
    seenMedNames.add(key);
    return true;
  });

  const rawTasks = (plan.daily_care_tasks || []).map((t) =>
    typeof t === 'string' ? t.trim() : ((t as { text?: string }).text ?? '').trim()
  ).filter(Boolean);
  // Merge repetitive tasks: same normalized text → one task
  const seenTaskText = new Map<string, string>();
  for (const text of rawTasks) {
    const normalized = text.toLowerCase().replace(/\s+/g, ' ');
    if (!normalized || seenTaskText.has(normalized)) continue;
    seenTaskText.set(normalized, text);
  }
  const daily_care_tasks = Array.from(seenTaskText.values());

  const rawRules = (plan.emergency_rules || []).map((r) => ({
    rule: (r.rule ?? '').trim(),
    confidence: r.confidence ?? 'medium',
    source_quote: r.source_quote ?? '',
  })).filter((r) => r.rule);
  // Group emergency rules by action verb. Merge all "Call 911" rules into one item with bullet conditions.
  const call911Conditions: string[] = [];
  const otherRules: { rule: string; confidence: string; source_quote: string }[] = [];
  for (const r of rawRules) {
    const lower = r.rule.toLowerCase();
    if (lower.includes('call 911')) {
      const condition = r.rule.replace(/call\s*911\s*(?:if|when|:)?\s*/gi, '').trim() || r.rule;
      if (condition && !call911Conditions.some((c) => c.toLowerCase() === condition.toLowerCase())) call911Conditions.push(condition);
    } else {
      otherRules.push(r);
    }
  }
  const emergency_rules: { rule: string; confidence: string; source_quote: string }[] = [];
  if (call911Conditions.length > 0) {
    emergency_rules.push({
      rule: call911Conditions.length === 1 ? `Call 911 if ${call911Conditions[0]}` : `Call 911 if:\n${call911Conditions.map((c) => `• ${c}`).join('\n')}`,
      confidence: 'medium',
      source_quote: '',
    });
  }
  emergency_rules.push(...otherRules);

  const restrictions = (plan.restrictions || []).map((r) => (typeof r === 'string' ? r : '')).filter(Boolean);

  const followups = (plan.followups || []).map((f) => {
    const desc = typeof f === 'string' ? f : (f && typeof (f as FollowUp).description === 'string' ? (f as FollowUp).description : String((f as FollowUp)?.description ?? ''));
    const timeframe = typeof f === 'object' && f ? ((f as FollowUp).suggested_timeframe ?? '') : '';
    const reminder = typeof f === 'object' && f ? ((f as FollowUp).reminder ?? 'none') : 'none';
    return { description: desc, suggested_timeframe: timeframe, reminder: reminder as FollowUp['reminder'], create_reminder: (f as FollowUp)?.create_reminder ?? false };
  });

  return { medications, daily_care_tasks, emergency_rules, restrictions, followups };
}

type SheetType = 'medication' | 'task' | 'emergency' | 'restriction' | 'followup';

const SWIPE_DELETE_WIDTH = 72;

function SwipeableTaskRow({ text, onPress, onDelete }: { text: string; onPress: () => void; onDelete: () => void }) {
  const translateX = useRef(new Animated.Value(0)).current;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: (_, g) => {
        if (g.dx <= 0) translateX.setValue(Math.max(g.dx, -SWIPE_DELETE_WIDTH));
      },
      onPanResponderRelease: (_, g) => {
        const open = g.dx < -SWIPE_DELETE_WIDTH / 2;
        Animated.spring(translateX, {
          toValue: open ? -SWIPE_DELETE_WIDTH : 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.swipeRowWrap}>
      <View style={styles.swipeDeleteBg}>
        <Pressable style={styles.swipeDeleteBtn} onPress={onDelete}>
          <Text style={styles.swipeDeleteText}>Delete</Text>
        </Pressable>
      </View>
      <Animated.View style={[styles.swipeRowContent, { transform: [{ translateX }] }]} {...pan.panHandlers}>
        <Pressable style={styles.taskRowView} onPress={onPress}>
          <Text style={styles.taskText} numberOfLines={2}>{text || '—'}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function ReviewCarePlanScreen() {
  const params = useLocalSearchParams<{ parsed_plan?: string; skipped_count?: string }>();

  const [editablePlan, setEditablePlan] = useState<EditableCarePlan | null>(null);
  const initialPlanRef = useRef<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openSheet, setOpenSheet] = useState<{ type: SheetType; index: number } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  useEffect(() => {
    let parsed: CarePlan | null = null;
    try {
      parsed = params.parsed_plan ? JSON.parse(params.parsed_plan) : null;
    } catch {
      parsed = null;
    }
    const plan = parsed ?? ({} as CarePlan);
    const normalized = normalizeApiPlan(plan);
    setEditablePlan(normalized);
    initialPlanRef.current = params.parsed_plan ?? null;
  }, [params.parsed_plan]);

  const hasUnsavedChanges = editablePlan && initialPlanRef.current
    ? JSON.stringify(normalizeApiPlan(JSON.parse(initialPlanRef.current))) !== JSON.stringify(editablePlan)
    : false;

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) setShowDiscardModal(true);
    else router.back();
  }, [hasUnsavedChanges]);

  const discardAndBack = useCallback(() => {
    setShowDiscardModal(false);
    router.back();
  }, []);

  const updateMed = useCallback((index: number, patch: Partial<Medication>) => {
    setEditablePlan((s) => {
      if (!s) return s;
      const next = [...s.medications];
      next[index] = { ...next[index], ...patch };
      return { ...s, medications: next };
    });
  }, []);

  const deleteMed = useCallback((index: number) => {
    setEditablePlan((s) => s ? { ...s, medications: s.medications.filter((_, i) => i !== index) } : s);
    setOpenSheet(null);
  }, []);

  const addMed = useCallback((med: Medication) => {
    setEditablePlan((s) => s ? { ...s, medications: [...s.medications, med] } : s);
    setOpenSheet(null);
  }, []);

  const updateTask = useCallback((index: number, text: string) => {
    setEditablePlan((s) => {
      if (!s) return s;
      const next = [...s.daily_care_tasks];
      next[index] = text;
      return { ...s, daily_care_tasks: next };
    });
  }, []);

  const [deletedTaskToast, setDeletedTaskToast] = useState<{ text: string; index: number } | null>(null);

  const deleteTask = useCallback((index: number, taskText: string) => {
    setEditablePlan((s) => s ? { ...s, daily_care_tasks: s.daily_care_tasks.filter((_, i) => i !== index) } : s);
    setOpenSheet((sheet) => (sheet?.type === 'task' && sheet.index === index ? null : sheet));
    setDeletedTaskToast({ text: taskText, index });
  }, []);

  const undoDeleteTask = useCallback(() => {
    if (!deletedTaskToast || !editablePlan) return;
    const { text, index } = deletedTaskToast;
    const next = [...editablePlan.daily_care_tasks];
    next.splice(Math.min(index, next.length), 0, text);
    setEditablePlan((s) => s ? { ...s, daily_care_tasks: next } : s);
    setDeletedTaskToast(null);
  }, [deletedTaskToast, editablePlan]);

  useEffect(() => {
    if (!deletedTaskToast) return;
    const t = setTimeout(() => setDeletedTaskToast(null), 4000);
    return () => clearTimeout(t);
  }, [deletedTaskToast]);

  const addTask = useCallback((text: string) => {
    setEditablePlan((s) => s ? { ...s, daily_care_tasks: [...s.daily_care_tasks, text] } : s);
    setOpenSheet(null);
  }, []);

  const updateRule = useCallback((index: number, rule: string) => {
    setEditablePlan((s) => {
      if (!s) return s;
      const next = [...s.emergency_rules];
      next[index] = { ...next[index], rule };
      return { ...s, emergency_rules: next };
    });
  }, []);

  const deleteRule = useCallback((index: number) => {
    setEditablePlan((s) => s ? { ...s, emergency_rules: s.emergency_rules.filter((_, i) => i !== index) } : s);
    setOpenSheet(null);
  }, []);

  const addRule = useCallback((rule: string) => {
    setEditablePlan((s) => s ? { ...s, emergency_rules: [...s.emergency_rules, { rule, confidence: 'medium', source_quote: '' }] } : s);
    setOpenSheet(null);
  }, []);

  const updateRestriction = useCallback((index: number, value: string) => {
    setEditablePlan((s) => {
      if (!s) return s;
      const next = [...s.restrictions];
      next[index] = value;
      return { ...s, restrictions: next };
    });
  }, []);

  const deleteRestriction = useCallback((index: number) => {
    setEditablePlan((s) => s ? { ...s, restrictions: s.restrictions.filter((_, i) => i !== index) } : s);
    setOpenSheet(null);
  }, []);

  const addRestriction = useCallback((value: string) => {
    setEditablePlan((s) => s ? { ...s, restrictions: [...s.restrictions, value] } : s);
    setOpenSheet(null);
  }, []);

  const updateFollowup = useCallback((index: number, patch: Partial<FollowUp>) => {
    setEditablePlan((s) => {
      if (!s) return s;
      const next = [...s.followups];
      next[index] = { ...next[index], ...patch };
      return { ...s, followups: next };
    });
  }, []);

  const deleteFollowup = useCallback((index: number) => {
    setEditablePlan((s) => s ? { ...s, followups: s.followups.filter((_, i) => i !== index) } : s);
    setOpenSheet(null);
  }, []);

  const addFollowup = useCallback((f: FollowUp) => {
    setEditablePlan((s) => s ? { ...s, followups: [...s.followups, f] } : s);
    setOpenSheet(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!editablePlan) return;
    setConfirming(true);
    try {
      const payload = {
        care_plan: {
          medications: editablePlan.medications,
          daily_care_tasks: editablePlan.daily_care_tasks,
          emergency_rules: editablePlan.emergency_rules,
          restrictions: editablePlan.restrictions.filter(Boolean),
          followups: editablePlan.followups,
        },
      };
      const res = await fetch(`${API_BASE_URL}/api/confirm-care-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Confirm failed');
      const carePlanForQuests = {
        medications: editablePlan.medications,
        daily_care_tasks: editablePlan.daily_care_tasks,
        restrictions: editablePlan.restrictions.filter(Boolean),
      };
      const quests = generateChildQuests(carePlanForQuests);
      await setQuests(quests);
      router.replace('/parent-signup');
    } catch {
      Alert.alert('Error', 'Could not save. Try again.');
    } finally {
      setConfirming(false);
    }
  }, [editablePlan]);

  const hasRescueMeds = editablePlan?.medications.some((m) => m.type === 'rescue') ?? false;
  const hasEmergencyRule = editablePlan?.emergency_rules.some(
    (r) => /call\s*911|emergency/i.test(r.rule)
  ) ?? false;
  const showEmergencyNotice = hasRescueMeds && !hasEmergencyRule;

  if (!editablePlan) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8BC34A" />
        <Text style={styles.loadingText}>Loading care plan…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.backWrap} onPress={handleBack} hitSlop={12}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Pressable
            style={styles.editToggle}
            onPress={() => setIsEditMode((e) => !e)}
            hitSlop={12}
          >
            <Text style={styles.editToggleText}>{isEditMode ? 'Done' : 'Edit'}</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Review Care Plan</Text>
        <Text style={styles.subtitle}>Check details before tasks are created</Text>

        {/* 1. Medication */}
        <SectionCard title="Medication" count={editablePlan.medications.length} defaultExpanded>
          {editablePlan.medications.length === 0 ? (
            <Text style={styles.emptyState}>No items found. Add manually.</Text>
          ) : (
            editablePlan.medications.map((med, i) => (
              <Pressable
                key={i}
                style={styles.medRow}
                onPress={() => setOpenSheet({ type: 'medication', index: i })}
              >
                <Text style={styles.medName}>{med.name || 'Unnamed'}</Text>
                <Text style={styles.medMeta}>{[med.dose, med.frequency].filter(Boolean).join(' · ') || '—'}</Text>
                {med.timing?.length > 0 ? (
                  <View style={styles.chipRow}>
                    {med.timing.slice(0, 4).map((t, j) => (
                      <View key={j} style={styles.chip}><Text style={styles.chipText}>{t}</Text></View>
                    ))}
                  </View>
                ) : null}
                <View style={styles.rowFooter}>
                  <View style={[styles.typeBadge, med.type === 'rescue' && styles.typeRescue]}>
                    <Text style={styles.typeBadgeText}>{med.type || 'daily'}</Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
          {isEditMode && (
            <Pressable style={styles.addRow} onPress={() => setOpenSheet({ type: 'medication', index: -1 })} hitSlop={12}>
              <Text style={styles.addRowText}>Add medication</Text>
            </Pressable>
          )}
        </SectionCard>

        {/* 2. Daily Care Tasks */}
        <SectionCard title="Daily Care Tasks" count={editablePlan.daily_care_tasks.length} defaultExpanded>
          {editablePlan.daily_care_tasks.length === 0 ? (
            isEditMode ? (
              <>
                <Text style={styles.taskEmptyEdit}>No daily tasks yet</Text>
                <Pressable style={styles.addRow} onPress={() => setOpenSheet({ type: 'task', index: -1 })} hitSlop={12}>
                  <Text style={styles.addRowText}>Add task</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.taskEmptyView}>No daily tasks</Text>
            )
          ) : (
            editablePlan.daily_care_tasks.map((t, i) =>
              isEditMode ? (
                <SwipeableTaskRow
                  key={i}
                  text={t}
                  onPress={() => setOpenSheet({ type: 'task', index: i })}
                  onDelete={() => deleteTask(i, t)}
                />
              ) : (
                <Pressable
                  key={i}
                  style={styles.taskRowView}
                  onPress={() => setOpenSheet({ type: 'task', index: i })}
                >
                  <Text style={styles.taskText} numberOfLines={2}>{t || '—'}</Text>
                </Pressable>
              )
            )
          )}
          {isEditMode && editablePlan.daily_care_tasks.length > 0 && (
            <Pressable style={styles.addRow} onPress={() => setOpenSheet({ type: 'task', index: -1 })} hitSlop={12}>
              <Text style={styles.addRowText}>Add task</Text>
            </Pressable>
          )}
        </SectionCard>

        {/* 3. Emergency Procedures */}
        <SectionCard title="Emergency Procedures" count={editablePlan.emergency_rules.length} defaultExpanded>
          {showEmergencyNotice && (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>Emergency call guidance not detected. Add if needed.</Text>
            </View>
          )}
          {editablePlan.emergency_rules.length === 0 ? (
            <Text style={styles.emptyState}>No items found. Add manually.</Text>
          ) : (
            editablePlan.emergency_rules.map((r, i) => (
              <Pressable
                key={i}
                style={styles.ruleRow}
                onPress={() => setOpenSheet({ type: 'emergency', index: i })}
              >
                <Text style={styles.ruleText} numberOfLines={2}>{r.rule || '—'}</Text>
              </Pressable>
            ))
          )}
          {isEditMode && (
            <Pressable style={styles.addRow} onPress={() => setOpenSheet({ type: 'emergency', index: -1 })} hitSlop={12}>
              <Text style={styles.addRowText}>Add emergency rule</Text>
            </Pressable>
          )}
        </SectionCard>

        {/* 4. Activity Restrictions */}
        <SectionCard title="Activity Restrictions" count={editablePlan.restrictions.filter(Boolean).length} defaultExpanded>
          {editablePlan.restrictions.length === 0 ? (
            <Text style={styles.emptyState}>No items found. Add manually.</Text>
          ) : (
            editablePlan.restrictions.map((r, i) => (
              <View key={i} style={styles.restrictionRow}>
                {isEditMode ? (
                  <Pressable style={styles.restrictionChip} onPress={() => setOpenSheet({ type: 'restriction', index: i })}>
                    <Text style={styles.restrictionChipText} numberOfLines={1}>{r || 'Restriction'}</Text>
                  </Pressable>
                ) : (
                  <View style={styles.restrictionChip}><Text style={styles.restrictionChipText}>{r || '—'}</Text></View>
                )}
                {isEditMode && (
                  <Pressable onLongPress={() => Alert.alert('Delete', 'Remove this restriction?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteRestriction(i) },
                  ])}>
                    <Text style={styles.deleteLinkText}>Delete</Text>
                  </Pressable>
                )}
              </View>
            ))
          )}
          {isEditMode && (
            <Pressable style={styles.addRow} onPress={() => setOpenSheet({ type: 'restriction', index: -1 })} hitSlop={12}>
              <Text style={styles.addRowText}>Add restriction</Text>
            </Pressable>
          )}
        </SectionCard>

        {/* 5. Follow Up Care */}
        <SectionCard title="Follow Up Care" count={editablePlan.followups.length} defaultExpanded>
          {editablePlan.followups.length === 0 ? (
            <Text style={styles.emptyState}>No items found. Add manually.</Text>
          ) : (
            editablePlan.followups.map((f, i) => (
              <Pressable
                key={i}
                style={styles.followupRow}
                onPress={() => setOpenSheet({ type: 'followup', index: i })}
              >
                <Text style={styles.followupText} numberOfLines={2}>{f.description ?? '—'}</Text>
                <View style={[styles.pill, (f.reminder && f.reminder !== 'none') ? styles.pillOn : undefined]}>
                  <Text style={styles.pillText}>{(f.reminder && f.reminder !== 'none') ? 'Reminder set' : 'No reminder'}</Text>
                </View>
              </Pressable>
            ))
          )}
          {isEditMode && (
            <Pressable style={styles.addRow} onPress={() => setOpenSheet({ type: 'followup', index: -1 })} hitSlop={12}>
              <Text style={styles.addRowText}>Add follow-up</Text>
            </Pressable>
          )}
        </SectionCard>

        <Pressable
          style={[styles.confirmBtn, confirming && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={confirming}
          hitSlop={12}
        >
          <Text style={styles.confirmBtnText}>{confirming ? 'Saving…' : 'Confirm care plan'}</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom sheets */}
      {openSheet?.type === 'medication' && (
        <MedicationSheet
          plan={editablePlan}
          index={openSheet.index}
          isEditMode={isEditMode}
          onClose={() => setOpenSheet(null)}
          onSave={(med) => { openSheet.index >= 0 ? updateMed(openSheet.index, med) : addMed(med); setOpenSheet(null); }}
          onDelete={openSheet.index >= 0 ? () => { deleteMed(openSheet.index); setOpenSheet(null); } : undefined}
        />
      )}
      {openSheet?.type === 'task' && openSheet.index >= 0 && !isEditMode && (
        <Modal visible transparent animationType="slide">
          <Pressable style={styles.sheetBackdrop} onPress={() => setOpenSheet(null)}>
            <View style={styles.sheet} onStartShouldSetResponder={() => true}>
              <Text style={styles.sheetTitle}>Task</Text>
              <Text style={styles.readOnlyRow}>{editablePlan.daily_care_tasks[openSheet.index] ?? '—'}</Text>
              <Pressable style={styles.saveBtn} onPress={() => setOpenSheet(null)}>
                <Text style={styles.saveBtnText}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
      {openSheet?.type === 'task' && (isEditMode || openSheet.index === -1) && (
        <EditTaskBottomSheet
          visible={true}
          initialText={openSheet.index >= 0 ? (editablePlan.daily_care_tasks[openSheet.index] ?? '') : ''}
          isNew={openSheet.index === -1}
          onSave={(text) => { openSheet.index >= 0 ? updateTask(openSheet.index, text) : addTask(text); setOpenSheet(null); }}
          onDelete={openSheet.index >= 0 ? () => deleteTask(openSheet.index, editablePlan.daily_care_tasks[openSheet.index]) : undefined}
          onClose={() => setOpenSheet(null)}
        />
      )}
      {openSheet?.type === 'emergency' && (
        <EmergencySheet
          plan={editablePlan}
          index={openSheet.index}
          isEditMode={isEditMode}
          onClose={() => setOpenSheet(null)}
          onSave={(rule) => { openSheet.index >= 0 ? updateRule(openSheet.index, rule) : addRule(rule); setOpenSheet(null); }}
          onDelete={openSheet.index >= 0 ? () => { deleteRule(openSheet.index); setOpenSheet(null); } : undefined}
        />
      )}
      {openSheet?.type === 'restriction' && (
        <RestrictionSheet
          plan={editablePlan}
          index={openSheet.index}
          onClose={() => setOpenSheet(null)}
          onSave={(v) => { openSheet.index >= 0 ? updateRestriction(openSheet.index, v) : addRestriction(v); setOpenSheet(null); }}
        />
      )}
      {openSheet?.type === 'followup' && (
        <FollowupSheet
          plan={editablePlan}
          index={openSheet.index}
          isEditMode={isEditMode}
          onClose={() => setOpenSheet(null)}
          onSave={(f) => { openSheet.index >= 0 ? updateFollowup(openSheet.index, f) : addFollowup(f); setOpenSheet(null); }}
          onDelete={openSheet.index >= 0 ? () => { deleteFollowup(openSheet.index); setOpenSheet(null); } : undefined}
        />
      )}

      {deletedTaskToast && (
        <View style={styles.toastWrap}>
          <Text style={styles.toastText}>Task deleted</Text>
          <Pressable onPress={undoDeleteTask} style={styles.toastUndo}>
            <Text style={styles.toastUndoText}>Undo</Text>
          </Pressable>
        </View>
      )}

      <Modal visible={showDiscardModal} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setShowDiscardModal(false)}>
          <Pressable style={styles.discardBox} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.discardTitle}>Discard changes?</Text>
            <View style={styles.discardActions}>
              <Pressable style={styles.discardSecondaryBtn} onPress={() => setShowDiscardModal(false)}>
                <Text style={styles.discardSecondaryText}>Keep editing</Text>
              </Pressable>
              <Pressable style={styles.discardPrimaryBtn} onPress={discardAndBack}>
                <Text style={styles.discardPrimaryText}>Discard</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// --- Bottom sheet components (inline for brevity) ---

function MedicationSheet({
  plan,
  index,
  isEditMode,
  onClose,
  onSave,
  onDelete,
}: {
  plan: EditableCarePlan;
  index: number;
  isEditMode: boolean;
  onClose: () => void;
  onSave: (m: Medication) => void;
  onDelete?: () => void;
}) {
  const med = index >= 0 ? plan.medications[index] : null;
  const [name, setName] = useState(med?.name ?? '');
  const [dose, setDose] = useState(med?.dose ?? '');
  const [frequency, setFrequency] = useState(med?.frequency ?? '');
  const [timingStr, setTimingStr] = useState((med?.timing ?? []).join(', '));
  const [type, setType] = useState<'daily' | 'rescue'>(med?.type ?? 'daily');

  const handleSave = () => {
    onSave({
      name: name.trim() || 'Unnamed',
      dose: dose.trim(),
      frequency: frequency.trim(),
      timing: timingStr.split(',').map((t) => t.trim()).filter(Boolean),
      type,
      confidence: med?.confidence ?? 'medium',
      source_quote: med?.source_quote ?? '',
    });
  };

  return (
    <Modal visible transparent animationType="slide">
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.sheetTitle}>{index >= 0 ? (isEditMode ? 'Edit medication' : 'Medication') : 'Add medication'}</Text>
          {isEditMode || index < 0 ? (
            <>
              <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} placeholderTextColor="#999" />
              <TextInput style={styles.input} placeholder="Dose" value={dose} onChangeText={setDose} placeholderTextColor="#999" />
              <TextInput style={styles.input} placeholder="Frequency" value={frequency} onChangeText={setFrequency} placeholderTextColor="#999" />
              <TextInput style={styles.input} placeholder="Timing (e.g. 8:00 AM, 8:00 PM)" value={timingStr} onChangeText={setTimingStr} placeholderTextColor="#999" />
              <View style={styles.segmentedRow}>
                <Pressable style={[styles.segmentedBtn, type === 'daily' && styles.segmentedBtnOn]} onPress={() => setType('daily')} hitSlop={8}>
                  <Text style={[styles.segmentedText, type === 'daily' && styles.segmentedTextOn]}>Daily</Text>
                </Pressable>
                <Pressable style={[styles.segmentedBtn, type === 'rescue' && styles.segmentedBtnOn]} onPress={() => setType('rescue')} hitSlop={8}>
                  <Text style={[styles.segmentedText, type === 'rescue' && styles.segmentedTextOn]}>Rescue</Text>
                </Pressable>
              </View>
              {onDelete && (
                <Pressable onPress={onDelete} style={styles.deleteAction} hitSlop={8}>
                  <Text style={styles.deleteActionText}>Delete medication</Text>
                </Pressable>
              )}
              <Pressable style={styles.saveBtn} onPress={handleSave} hitSlop={8}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.readOnlyRow}>Name: {med?.name || '—'}</Text>
              <Text style={styles.readOnlyRow}>Dose: {med?.dose || '—'}</Text>
              <Text style={styles.readOnlyRow}>Frequency: {med?.frequency || '—'}</Text>
              {med?.timing?.length ? <Text style={styles.readOnlyRow}>Timing: {med.timing.join(', ')}</Text> : null}
              <Text style={styles.readOnlyRow}>Type: {med?.type || 'daily'}</Text>
              <Pressable style={styles.saveBtn} onPress={onClose} hitSlop={8}>
                <Text style={styles.saveBtnText}>Close</Text>
              </Pressable>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

function EmergencySheet({
  plan,
  index,
  isEditMode,
  onClose,
  onSave,
  onDelete,
}: {
  plan: EditableCarePlan;
  index: number;
  isEditMode: boolean;
  onClose: () => void;
  onSave: (rule: string) => void;
  onDelete?: () => void;
}) {
  const rule = index >= 0 ? plan.emergency_rules[index] : null;
  const [ruleText, setRuleText] = useState(rule?.rule ?? '');

  return (
    <Modal visible transparent animationType="slide">
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.sheetTitle}>{index >= 0 ? (isEditMode ? 'Edit emergency rule' : 'Emergency rule') : 'Add emergency rule'}</Text>
          {isEditMode || index < 0 ? (
            <>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Rule" value={ruleText} onChangeText={setRuleText} placeholderTextColor="#999" multiline />
              {onDelete && (
                <Pressable onPress={onDelete} style={styles.deleteAction} hitSlop={8}>
                  <Text style={styles.deleteActionText}>Delete rule</Text>
                </Pressable>
              )}
              <Pressable style={styles.saveBtn} onPress={() => { onSave(ruleText.trim() || 'Rule'); }} hitSlop={8}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.readOnlyRow}>{rule?.rule || '—'}</Text>
              <Pressable style={styles.saveBtn} onPress={onClose} hitSlop={8}>
                <Text style={styles.saveBtnText}>Close</Text>
              </Pressable>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

function RestrictionSheet({ plan, index, onClose, onSave }: { plan: EditableCarePlan; index: number; onClose: () => void; onSave: (v: string) => void }) {
  const value = index >= 0 ? plan.restrictions[index] ?? '' : '';
  const [text, setText] = useState(value);

  return (
    <Modal visible transparent animationType="slide">
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.sheetTitle}>{index >= 0 ? 'Edit restriction' : 'Add restriction'}</Text>
          <TextInput style={styles.input} placeholder="Restriction" value={text} onChangeText={setText} placeholderTextColor="#999" />
          <Pressable style={styles.saveBtn} onPress={() => { onSave(text.trim()); }} hitSlop={8}>
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const REMINDER_OPTIONS: { value: FollowUp['reminder']; label: string }[] = [
  { value: 'none', label: 'No reminder' },
  { value: '1_week', label: '1 week' },
  { value: '2_weeks', label: '2 weeks' },
  { value: '1_month', label: '1 month' },
];

function FollowupSheet({
  plan,
  index,
  isEditMode,
  onClose,
  onSave,
  onDelete,
}: {
  plan: EditableCarePlan;
  index: number;
  isEditMode: boolean;
  onClose: () => void;
  onSave: (f: FollowUp) => void;
  onDelete?: () => void;
}) {
  const f = index >= 0 ? plan.followups[index] : null;
  const [description, setDescription] = useState(f?.description ?? '');
  const [reminder, setReminder] = useState<FollowUp['reminder']>(f?.reminder ?? 'none');

  const handleSave = () => {
    onSave({ description: description.trim() || 'Follow-up', suggested_timeframe: f?.suggested_timeframe ?? '', reminder, create_reminder: reminder !== 'none' });
  };

  return (
    <Modal visible transparent animationType="slide">
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.sheetTitle}>{index >= 0 ? (isEditMode ? 'Edit follow-up' : 'Follow-up') : 'Add follow-up'}</Text>
          {isEditMode || index < 0 ? (
            <>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Follow-up" value={description} onChangeText={setDescription} placeholderTextColor="#999" multiline />
              <Text style={styles.sheetLabel}>Reminder</Text>
              <View style={styles.reminderRow}>
                {REMINDER_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[styles.segmentedBtn, reminder === opt.value && styles.segmentedBtnOn]}
                    onPress={() => setReminder(opt.value)}
                    hitSlop={8}
                  >
                    <Text style={[styles.segmentedText, reminder === opt.value && styles.segmentedTextOn]}>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>
              {onDelete && (
                <Pressable onPress={onDelete} style={styles.deleteAction} hitSlop={8}>
                  <Text style={styles.deleteActionText}>Delete follow-up</Text>
                </Pressable>
              )}
              <Pressable style={styles.saveBtn} onPress={handleSave} hitSlop={8}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.readOnlyRow}>{f?.description || '—'}</Text>
              <Text style={styles.readOnlyRow}>Reminder: {(f?.reminder && f.reminder !== 'none') ? f.reminder : 'None'}</Text>
              <Pressable style={styles.saveBtn} onPress={onClose} hitSlop={8}>
                <Text style={styles.saveBtnText}>Close</Text>
              </Pressable>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0eeee' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#6B6B7B' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 52, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backWrap: { paddingVertical: 12, paddingRight: 16, minHeight: 48, justifyContent: 'center' },
  backText: { color: '#8BC34A', fontSize: 17, fontWeight: '600' },
  editToggle: { paddingVertical: 12, paddingHorizontal: 8 },
  editToggleText: { color: '#8BC34A', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: '#2C2C2C', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#6B6B7B', marginBottom: 20, textAlign: 'center', fontStyle: 'italic' },
  emptyState: { fontSize: 14, color: '#6B6B7B', fontStyle: 'italic', marginBottom: 12 },
  noticeBox: { backgroundColor: 'rgba(255, 193, 7, 0.15)', padding: 12, borderRadius: 10, marginBottom: 12 },
  noticeText: { fontSize: 13, color: '#2C2C2C' },
  medRow: { backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 14, marginBottom: 10 },
  medName: { fontSize: 16, fontWeight: '700', color: '#2C2C2C', marginBottom: 4 },
  medMeta: { fontSize: 14, color: '#6B6B7B', marginBottom: 4 },
  medMetaSecondary: { fontSize: 13, color: '#6B6B7B', marginBottom: 6 },
  emergencyBlockTitle: { fontSize: 16, fontWeight: '700', color: '#2C2C2C', marginBottom: 10 },
  ruleBullet: { marginBottom: 6 },
  ruleBulletText: { fontSize: 15, color: '#2C2C2C', lineHeight: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  chip: { backgroundColor: 'rgba(139, 195, 74, 0.2)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  chipText: { fontSize: 13, color: '#2C2C2C' },
  rowFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeBadge: { backgroundColor: 'rgba(139, 195, 74, 0.25)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  typeRescue: { backgroundColor: 'rgba(244, 67, 54, 0.2)' },
  typeBadgeText: { fontSize: 12, fontWeight: '600', color: '#2C2C2C' },
  confidenceText: { fontSize: 12, color: '#6B6B7B' },
  taskRowView: { minHeight: 44, justifyContent: 'center', paddingVertical: 12, marginBottom: 4 },
  taskText: { fontSize: 15, color: '#2C2C2C' },
  taskEmptyView: { fontSize: 15, color: '#6B6B7B', fontStyle: 'italic', marginBottom: 8 },
  taskEmptyEdit: { fontSize: 15, color: '#6B6B7B', fontStyle: 'italic', marginBottom: 12 },
  swipeRowWrap: { position: 'relative', overflow: 'hidden', marginBottom: 4 },
  swipeDeleteBg: { position: 'absolute', right: 0, top: 0, bottom: 0, width: SWIPE_DELETE_WIDTH, backgroundColor: '#c62828', justifyContent: 'center', alignItems: 'center' },
  swipeDeleteBtn: { flex: 1, justifyContent: 'center', paddingHorizontal: 12 },
  swipeDeleteText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  swipeRowContent: { backgroundColor: '#fff', alignSelf: 'stretch' },
  pill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.08)' },
  pillOn: { backgroundColor: 'rgba(139, 195, 74, 0.3)' },
  pillText: { fontSize: 12, fontWeight: '600', color: '#2C2C2C' },
  deleteLinkText: { fontSize: 13, color: '#c62828', fontWeight: '600' },
  toastWrap: { position: 'absolute', bottom: 24, left: 24, right: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2C2C2C', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12 },
  toastText: { fontSize: 15, color: '#fff' },
  toastUndo: { paddingVertical: 4, paddingHorizontal: 8 },
  toastUndoText: { fontSize: 15, fontWeight: '600', color: '#8BC34A' },
  ruleRow: { backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 14, marginBottom: 10 },
  ruleText: { fontSize: 15, color: '#2C2C2C', marginBottom: 4 },
  sourceLink: { marginTop: 8, fontSize: 14, color: '#8BC34A', fontWeight: '600' }, 
  restrictionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  restrictionChip: { flex: 1, backgroundColor: 'rgba(139, 195, 74, 0.15)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  restrictionChipText: { fontSize: 14, color: '#2C2C2C' },
  followupRow: { backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 14, marginBottom: 10 },
  followupText: { fontSize: 15, color: '#2C2C2C', marginBottom: 6 },
  addRow: { paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#8BC34A', borderRadius: 14, marginTop: 4 },
  addRowText: { fontSize: 15, fontWeight: '600', color: '#8BC34A' },
  confirmBtn: { backgroundColor: '#8BC34A', paddingVertical: 18, borderRadius: 28, alignItems: 'center', marginTop: 16 },
  confirmBtnDisabled: { opacity: 0.7 },
  confirmBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  sheetBackdrop: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#2C2C2C', marginBottom: 20 },
  sheetLabel: { fontSize: 14, color: '#6B6B7B', marginBottom: 8 },
  input: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, padding: 14, fontSize: 15, color: '#2C2C2C', marginBottom: 12 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  segmentedRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  reminderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  segmentedBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.06)' },
  segmentedBtnOn: { backgroundColor: 'rgba(139, 195, 74, 0.3)' },
  segmentedText: { fontSize: 14, color: '#6B6B7B' },
  segmentedTextOn: { fontSize: 14, fontWeight: '600', color: '#2C2C2C' },
  readOnlyRow: { fontSize: 15, color: '#2C2C2C', marginBottom: 10 },
  deleteAction: { marginBottom: 12 },
  deleteActionText: { fontSize: 14, color: '#c62828', fontWeight: '600' },
  saveBtn: { backgroundColor: '#8BC34A', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', padding: 24 },
  discardBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  discardTitle: { fontSize: 18, fontWeight: '700', color: '#2C2C2C', marginBottom: 20, textAlign: 'center' },
  discardActions: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  discardSecondaryBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.08)' },
  discardSecondaryText: { fontSize: 16, fontWeight: '600', color: '#2C2C2C' },
  discardPrimaryBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, backgroundColor: '#c62828' },
  discardPrimaryText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
