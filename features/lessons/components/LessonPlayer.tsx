/**
 * Lesson Player - stepper, step renderer, nav controls
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Switch,
  View,
} from 'react-native';
import type { Lesson, LessonStep } from '../types';
import { LessonsTheme } from '../constants';
import {
  StoryStep,
  TapToRevealStep,
  DragSortStep,
  QuizStep,
  SimulationStep,
  MatchStep,
  BreathingBreakStep,
} from './steps';

interface LessonPlayerInnerProps {
  lesson: Lesson;
  currentStepIndex: number;
  currentStep: LessonStep | undefined;
  stepResponses: Record<number, unknown>;
  calmMode: boolean;
  readToMe: boolean;
  onCalmModeChange: (v: boolean) => void;
  onReadToMeChange: (v: boolean) => void;
  onStepComplete: (stepIndex: number, response: unknown) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export function LessonPlayerInner({
  lesson,
  currentStepIndex,
  currentStep,
  stepResponses,
  calmMode,
  readToMe,
  onCalmModeChange,
  onReadToMeChange,
  onStepComplete,
  onBack,
  onNext,
  canProceed,
}: LessonPlayerInnerProps) {
  const totalSteps = lesson.steps.length;
  const isInteractive =
    currentStep?.type !== 'STORY' && currentStep?.type !== 'BREATHING_BREAK';
  const showNext =
    (currentStep?.type === 'STORY' || currentStep?.type === 'BREATHING_BREAK') &&
    canProceed;

  const handleStepComplete = (response: unknown) => {
    onStepComplete(currentStepIndex, response);
  };

  const renderStep = () => {
    if (!currentStep) return null;
    const { type, payload } = currentStep;

    switch (type) {
      case 'STORY':
        return <StoryStep payload={payload as any} calmMode={calmMode} />;
      case 'TAP_TO_REVEAL':
        return (
          <TapToRevealStep
            payload={payload as any}
            onComplete={(r) => handleStepComplete({ ...r, correct: true })}
            calmMode={calmMode}
          />
        );
      case 'DRAG_SORT':
        return (
          <DragSortStep
            payload={payload as any}
            onComplete={(r) =>
              handleStepComplete({
                correct: r.correctCount === r.total,
                score: (r.correctCount / r.total) * 100,
              })
            }
            calmMode={calmMode}
          />
        );
      case 'QUIZ':
        return (
          <QuizStep
            payload={payload as any}
            onComplete={(r) => handleStepComplete({ correct: r.correct })}
            calmMode={calmMode}
          />
        );
      case 'SIMULATION':
        return (
          <SimulationStep
            payload={payload as any}
            onComplete={(r) => handleStepComplete({ correct: r.correct })}
            calmMode={calmMode}
          />
        );
      case 'MATCH':
        return (
          <MatchStep
            payload={payload as any}
            onComplete={(r) =>
              handleStepComplete({
                correct: r.correctCount === r.total,
                score: (r.correctCount / r.total) * 100,
              })
            }
            calmMode={calmMode}
          />
        );
      case 'BREATHING_BREAK':
        return (
          <BreathingBreakStep
            payload={payload as any}
            onComplete={handleStepComplete}
            calmMode={calmMode}
          />
        );
      default:
        return (
          <View style={styles.unknown}>
            <Text style={styles.unknownText}>Unknown step type</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Stepper dots */}
      <View style={styles.stepper}>
        {lesson.steps.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentStepIndex && styles.dotActive,
              i < currentStepIndex && styles.dotDone,
            ]}
            accessibilityLabel={`Step ${i + 1} of ${totalSteps}`}
          />
        ))}
      </View>

      {/* Step content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.toggles}>
          <View style={styles.toggle}>
            <Text style={styles.toggleLabel}>Read to me</Text>
            <Switch
              value={readToMe}
              onValueChange={onReadToMeChange}
              trackColor={{ false: '#ccc', true: LessonsTheme.primaryLight }}
              thumbColor={readToMe ? LessonsTheme.primary : '#f4f3f4'}
              accessibilityLabel="Toggle read to me"
            />
          </View>
          <View style={styles.toggle}>
            <Text style={styles.toggleLabel}>Calm mode</Text>
            <Switch
              value={calmMode}
              onValueChange={onCalmModeChange}
              trackColor={{ false: '#ccc', true: LessonsTheme.primaryLight }}
              thumbColor={calmMode ? LessonsTheme.primary : '#f4f3f4'}
              accessibilityLabel="Toggle calm mode"
            />
          </View>
        </View>
        <View style={styles.nav}>
          <Pressable
            style={({ pressed }) => [styles.navButton, pressed && styles.navPressed]}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={currentStepIndex === 0 ? 'Go back' : 'Previous step'}
          >
            <Ionicons name="chevron-back" size={24} color={LessonsTheme.primary} />
            <Text style={styles.navButtonText}>
              {currentStepIndex === 0 ? 'Back' : 'Previous'}
            </Text>
          </Pressable>
          {showNext && (
            <Pressable
              style={({ pressed }) => [
                styles.navButton,
                styles.navButtonPrimary,
                pressed && styles.navPressed,
              ]}
              onPress={onNext}
              accessibilityRole="button"
              accessibilityLabel="Next step"
            >
              <Text style={styles.navButtonTextPrimary}>Next</Text>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LessonsTheme.border,
  },
  dotActive: {
    backgroundColor: LessonsTheme.primary,
    transform: [{ scale: 1.3 }],
  },
  dotDone: {
    backgroundColor: LessonsTheme.primaryLight,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  unknown: {
    padding: 24,
    alignItems: 'center',
  },
  unknownText: {
    fontSize: 16,
    color: LessonsTheme.textMuted,
  },
  controls: {
    padding: 16,
    backgroundColor: LessonsTheme.cardBg,
    borderTopWidth: 1,
    borderTopColor: LessonsTheme.border,
  },
  toggles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 14,
    color: LessonsTheme.textMuted,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  navButtonPrimary: {
    backgroundColor: LessonsTheme.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  navPressed: {
    opacity: 0.8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LessonsTheme.primary,
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
