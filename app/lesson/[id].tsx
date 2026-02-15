/**
 * Lesson Player screen
 */

import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useProfile } from '@/features/profile/context/ProfileContext';
import { xpToLevel } from '@/features/profile/utils/leveling';
import { useLessons } from '@/features/lessons/context/LessonsContext';
import { LESSONS } from '@/features/lessons/data/lessons';
import type { Lesson, LessonProgress, LessonStep } from '@/features/lessons/types';
import { computeMasteryScore } from '@/features/lessons/utils/scoring';
import { DisclaimerBanner } from '@/features/lessons/components/DisclaimerBanner';
import { LessonPlayerInner } from '@/features/lessons/components/LessonPlayer';
import { RewardsModal } from '@/features/lessons/components/RewardsModal';

function LessonPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = LESSONS.find((l) => l.id === id);
  const { profile } = useProfile();
  const { getLessonProgress, saveLessonProgress, markLessonComplete } = useLessons();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepResponses, setStepResponses] = useState<Record<number, unknown>>({});
  const [showRewards, setShowRewards] = useState(false);
  const [calmMode, setCalmMode] = useState(false);
  const [readToMe, setReadToMe] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!lesson) return;
    getLessonProgress(lesson.id).then((p) => {
      if (p && !p.completed) {
        setCurrentStepIndex(p.currentStepIndex);
        setStepResponses(p.stepResponses ?? {});
      }
      setInitialized(true);
    });
  }, [lesson?.id, getLessonProgress]);

  useEffect(() => {
    if (!lesson || !initialized) return;
    const progress: LessonProgress = {
      lessonId: lesson.id,
      attempts: 0,
      currentStepIndex,
      lastCompletedAt: null,
      masteryScore: 0,
      stepResponses,
      completed: false,
    };
    saveLessonProgress(lesson.id, progress);
  }, [lesson?.id, currentStepIndex, stepResponses, initialized, saveLessonProgress]);

  const onStepComplete = useCallback(
    (stepIndex: number, response: unknown) => {
      if (!lesson) return;
      const next = { ...stepResponses, [stepIndex]: response };
      setStepResponses(next);

      if (stepIndex >= lesson.steps.length - 1) {
        const masteryScore = computeMasteryScore(lesson, next as Record<number, { correct?: boolean }>);
        markLessonComplete(lesson.id, {
          masteryScore,
          xp: lesson.reward.xp,
          coins: lesson.reward.coins,
          items: lesson.reward.items,
        });
        setShowRewards(true);
      } else {
        setCurrentStepIndex(stepIndex + 1);
      }
    },
    [lesson, stepResponses, markLessonComplete]
  );

  const onBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      router.back();
    }
  }, [currentStepIndex]);

  const onNext = useCallback(() => {
    if (!lesson) return;
    const step = lesson.steps[currentStepIndex];
    if (step.type === 'STORY' || step.type === 'BREATHING_BREAK') {
      onStepComplete(currentStepIndex, { completed: true });
    }
  }, [lesson, currentStepIndex, onStepComplete]);

  if (!lesson) {
    router.back();
    return null;
  }

  const currentStep = lesson.steps[currentStepIndex];
  const isLastStep = currentStepIndex >= lesson.steps.length - 1;
  const canProceed =
    currentStep?.type === 'STORY' ||
    currentStep?.type === 'BREATHING_BREAK' ||
    stepResponses[currentStepIndex] !== undefined;

  return (
    <View style={styles.container}>
      <DisclaimerBanner />
      <LessonPlayerInner
        lesson={lesson}
        currentStepIndex={currentStepIndex}
        currentStep={currentStep}
        stepResponses={stepResponses}
        calmMode={calmMode}
        readToMe={readToMe}
        onCalmModeChange={setCalmMode}
        onReadToMeChange={setReadToMe}
        onStepComplete={onStepComplete}
        onBack={onBack}
        onNext={onNext}
        canProceed={!!canProceed}
      />
      <RewardsModal
        visible={showRewards}
        xp={lesson.reward.xp}
        coins={lesson.reward.coins}
        items={lesson.reward.items}
        leveledUp={profile ? xpToLevel(profile.xp + lesson.reward.xp) > xpToLevel(profile.xp) : false}
        newLevel={profile ? xpToLevel(profile.xp + lesson.reward.xp) : undefined}
        onClose={() => {
          setShowRewards(false);
          router.back();
        }}
      />
    </View>
  );
}

export default LessonPlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4f0',
  },
});
