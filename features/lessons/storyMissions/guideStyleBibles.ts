/**
 * Guide style bibles - tone, props, NPCs, catchphrases for each guide
 */

import type { GuideId } from './models';

export interface GuideStyleBible {
  guideId: GuideId;
  tone: string[];
  recurringProps: string[];
  npcCast: string[];
  catchphrases: string[];
  humorStyle: string;
  settingPalette: string[];
  openingHook: string;
}

export const GUIDE_STYLE_BIBLES: Record<GuideId, GuideStyleBible> = {
  astronaut: {
    guideId: 'astronaut',
    tone: ['sparkly cosmic wonder', 'gentle sci curiosity', 'warm exploration'],
    recurringProps: ['star map', 'rhythm engine', 'comet hamster', 'control console', 'planet view screen'],
    npcCast: ['Mission Control', 'Comet Hamster', 'Stellar Octopus', 'Dr. Beep'],
    catchphrases: ['Systems nominal!', 'The stars remember.', 'Plot course to wonder.'],
    humorStyle: 'Gentle space puns, cosmic silliness, robot beeps',
    settingPalette: ['nebula', 'station', 'asteroid belt', 'planet surface', 'control room'],
    openingHook: 'You and Astronaut Panda blast off to explore a mysterious new planet. The rhythm engine hums—steady routines keep the ship strong!',
  },
  detective: {
    guideId: 'detective',
    tone: ['mystery noir kid-friendly', 'punny suspects', 'clue hunt fun'],
    recurringProps: ['clue board', 'magnifying monocle', 'case file', 'secret decoder', 'evidence bag'],
    npcCast: ['The Chief', 'Madame Whiskers', 'Captain Squeak', 'Inspector Nibbles'],
    catchphrases: ['Elementary, my dear panda!', 'The clue is in the details.', 'Case closed—almost!'],
    humorStyle: 'Punny names, silly clues, over-the-top detective drama',
    settingPalette: ['detective office', 'mysterious mansion', 'alley', 'library', 'clock tower'],
    openingHook: 'You and Detective Panda crack the case of the Missing Golden Acorn. Each clue leads deeper—and each reminds you: tell a trusted adult when something feels off!',
  },
  diver: {
    guideId: 'diver',
    tone: ['calm whimsical ocean', 'glowing serene', 'peaceful discovery'],
    recurringProps: ['glowing coral', 'bubble tech', 'dive checklist', 'oxygen gauge', 'shell compass'],
    npcCast: ['Turtle Librarian', 'Dive Buddy', 'Glowfish Choir', 'Coral Sage'],
    catchphrases: ['Breathe slow, dive deep.', 'The reef remembers.', 'Every bubble tells a story.'],
    humorStyle: 'Calm wordplay, gentle sea creatures, cozy underwater silliness',
    settingPalette: ['coral reef', 'kelp forest', 'sunken ship', 'bubble grotto', 'deep trench'],
    openingHook: 'You and Diver Panda explore the glowing coral kingdom. The Turtle Librarian has a quest—and your dive checklist reminds you: steady routines and telling your buddy keep you safe!',
  },
  treasure: {
    guideId: 'treasure',
    tone: ['adventure silly pirates', 'map riddles', 'relic hunting fun'],
    recurringProps: ['treasure map', 'compass', 'relic chest', 'jungle vine', 'ancient tablet'],
    npcCast: ['First Mate', 'Parrot Navigator', 'Jungle Sage', 'Relic Guardian'],
    catchphrases: ['X marks the spot—almost!', 'Adventure awaits!', 'The map never lies.'],
    humorStyle: 'Silly pirates, bumbling traps, map puns',
    settingPalette: ['jungle temple', 'beach camp', 'cave', 'treasure chamber', 'ship deck'],
    openingHook: 'You and Treasure Hunter Panda hunt the Lost Relic of Calm. The map has riddles—and your expedition plan says: tell your crew (a trusted adult) if you ever feel unsure!',
  },
};
