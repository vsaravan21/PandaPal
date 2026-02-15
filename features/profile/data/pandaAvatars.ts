/**
 * Shared panda avatar definitions for onboarding and Avatar tab.
 * Use getPandaAvatarIdForDisplay(id) for safe fallback to panda_default.
 */

import type { ImageSourcePropType } from 'react-native';

export const PANDA_DEFAULT_ID = 'panda_default';

export type PandaAvatarDef = {
  id: string;
  label: string;
  source: ImageSourcePropType;
};

const AVATARS: PandaAvatarDef[] = [
  { id: 'detective', label: 'Detective', source: require('../../../assets/images/detective_panda-Photoroom.png') },
  { id: 'treasure', label: 'Treasure Hunter', source: require('../../../assets/images/treasure panda-Photoroom.png') },
  { id: 'artist', label: 'Artist', source: require('../../../assets/images/aritst_panda-Photoroom.png') },
  { id: 'doctor', label: 'Doctor', source: require('../../../assets/images/doctor panda.jpg') },
  { id: 'astronaut', label: 'Astronaut', source: require('../../../assets/images/astronaut Panda-Photoroom.png') },
  { id: 'diver', label: 'Deep Sea Diver', source: require('../../../assets/images/deepsea diver panda-Photoroom.png') },
];

const BY_ID = new Map(AVATARS.map((a) => [a.id, a]));
const DEFAULT_AVATAR = AVATARS[0];

/** Resolve avatar id to display; missing or unknown id falls back to panda_default (first avatar). */
export function getPandaAvatarById(id: string | undefined | null): PandaAvatarDef {
  const resolved = id && id !== PANDA_DEFAULT_ID ? BY_ID.get(id) : null;
  return resolved ?? DEFAULT_AVATAR;
}

export function getPandaAvatarsList(): PandaAvatarDef[] {
  return [...AVATARS];
}
