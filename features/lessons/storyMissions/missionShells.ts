/**
 * Mission shells per guide - opening premise, sidekick, setting props
 * AI (or mock) continues from these.
 */

import type { GuideId } from './models';

export interface MissionShell {
  guideId: GuideId;
  openingPremise: string;
  sidekickNpc: string;
  settingProps: string[];
}

export const MISSION_SHELLS: Record<GuideId, MissionShell> = {
  astronaut: {
    guideId: 'astronaut',
    openingPremise:
      'You and Astronaut Panda are on a mission to explore a new planet. The ship’s console helps you remember: tell Mission Control (a trusted adult) if something feels off, and follow your flight plan.',
    sidekickNpc: 'Mission Control',
    settingProps: ['space console', 'control panel', 'planet view screen'],
  },
  detective: {
    guideId: 'detective',
    openingPremise:
      'You and Detective Panda are solving a mystery. Each clue reminds you: tell a trusted adult if you don’t feel right, and follow your case file (your seizure action plan).',
    sidekickNpc: 'The Chief',
    settingProps: ['clue board', 'case file', 'magnifying glass'],
  },
  diver: {
    guideId: 'diver',
    openingPremise:
      'You and Diver Panda are exploring the calm ocean. Your dive checklist says: tell your dive buddy (a trusted adult) if something feels wrong, and follow your safety plan.',
    sidekickNpc: 'Dive Buddy',
    settingProps: ['coral reef', 'dive checklist', 'oxygen gauge'],
  },
  treasure: {
    guideId: 'treasure',
    openingPremise:
      'You and Treasure Hunter Panda are on an adventure for relics. The treasure map says: tell your crew (a trusted adult) if you feel unsure, and follow your expedition plan.',
    sidekickNpc: 'First Mate',
    settingProps: ['treasure map', 'compass', 'relic chest'],
  },
};
