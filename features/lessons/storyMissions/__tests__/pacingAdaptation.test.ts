/**
 * Pacing engine and adaptation logic tests
 */

import {
  createInitialPacing,
  shouldShowLearningCheck,
  advancePacingAfterLearning,
  advancePacingAfterStory,
} from '../pacingEngine';
import {
  selectTargetConcept,
  applyMasteryUpdate,
  MASTERY_CORRECT_DELTA,
  MASTERY_INCORRECT_DELTA,
} from '../adaptation';

describe('pacingEngine', () => {
  describe('createInitialPacing', () => {
    it('returns nextLearningIn between 2 and 4 for fixed seed', () => {
      const p = createInitialPacing(12345);
      expect(p.scenesSinceLearning).toBe(0);
      expect(p.nextLearningIn).toBeGreaterThanOrEqual(2);
      expect(p.nextLearningIn).toBeLessThanOrEqual(4);
    });

    it('is deterministic for same seed', () => {
      expect(createInitialPacing(1).nextLearningIn).toBe(createInitialPacing(1).nextLearningIn);
    });
  });

  describe('shouldShowLearningCheck', () => {
    it('returns false when scenesSinceLearning < nextLearningIn', () => {
      expect(shouldShowLearningCheck({ scenesSinceLearning: 0, nextLearningIn: 3 })).toBe(false);
      expect(shouldShowLearningCheck({ scenesSinceLearning: 2, nextLearningIn: 3 })).toBe(false);
    });

    it('returns true when scenesSinceLearning >= nextLearningIn', () => {
      expect(shouldShowLearningCheck({ scenesSinceLearning: 3, nextLearningIn: 3 })).toBe(true);
      expect(shouldShowLearningCheck({ scenesSinceLearning: 4, nextLearningIn: 3 })).toBe(true);
    });
  });

  describe('advancePacingAfterLearning', () => {
    it('resets scenesSinceLearning and sets nextLearningIn in 2-4', () => {
      const before = { scenesSinceLearning: 3, nextLearningIn: 3 };
      const after = advancePacingAfterLearning(before, 99, 5);
      expect(after.scenesSinceLearning).toBe(0);
      expect(after.nextLearningIn).toBeGreaterThanOrEqual(2);
      expect(after.nextLearningIn).toBeLessThanOrEqual(4);
    });
  });

  describe('advancePacingAfterStory', () => {
    it('increments scenesSinceLearning', () => {
      const before = { scenesSinceLearning: 1, nextLearningIn: 3 };
      const after = advancePacingAfterStory(before);
      expect(after.scenesSinceLearning).toBe(2);
      expect(after.nextLearningIn).toBe(3);
    });
  });
});

describe('adaptation', () => {
  describe('selectTargetConcept', () => {
    it('picks a low-mastery concept when one is below 60', () => {
      const mastery = { routines: 40, tellingAdult: 70, actionPlan: 80 };
      const tag = selectTargetConcept(mastery, undefined);
      expect(tag).toBe('routines');
    });

    it('avoids same concept as last when last mastery > 30', () => {
      const mastery = { routines: 50, tellingAdult: 55 };
      const tag = selectTargetConcept(mastery, 'routines');
      expect(tag).not.toBe('routines');
    });

    it('allows same concept when mastery very low (< 30)', () => {
      const mastery = { routines: 20, tellingAdult: 90 };
      const tag = selectTargetConcept(mastery, 'routines');
      expect(['routines', 'tellingAdult', 'actionPlan', 'triggersDifferent', 'feelings']).toContain(tag);
    });

    it('returns undefined when all mastery >= 80 (bonus branch)', () => {
      const mastery = {
        routines: 85,
        tellingAdult: 90,
        actionPlan: 80,
        triggersDifferent: 82,
        feelings: 88,
      };
      const tag = selectTargetConcept(mastery, undefined);
      expect(tag).toBeUndefined();
    });
  });

  describe('applyMasteryUpdate', () => {
    it('increases by 10 on correct, clamped to 100', () => {
      const before = { routines: 50 };
      const after = applyMasteryUpdate(before, 'routines', true);
      expect(after.routines).toBe(60);
      const atMax = applyMasteryUpdate({ routines: 95 }, 'routines', true);
      expect(atMax.routines).toBe(100);
    });

    it('decreases by 5 on incorrect, clamped to 0', () => {
      const before = { routines: 50 };
      const after = applyMasteryUpdate(before, 'routines', false);
      expect(after.routines).toBe(45);
      const atMin = applyMasteryUpdate({ routines: 3 }, 'routines', false);
      expect(atMin.routines).toBe(0);
    });
  });
});
