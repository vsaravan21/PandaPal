/**
 * Profile context - level, XP, unlockables, equipped items
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ChildProfile, ItemSlot } from '../types';
import { UNLOCKABLES } from '../data/unlockables';
import * as profileStore from '../storage/profileStore';
import { xpToLevel, xpProgressToNextLevel } from '../utils/leveling';

type ProfileContextType = {
  profile: ChildProfile | null;
  loading: boolean;
  level: number;
  xpProgress: { current: number; needed: number; pct: number };
  unlockables: typeof UNLOCKABLES;
  equipItem: (slot: ItemSlot, itemId: string | null) => Promise<void>;
  unlockItem: (itemId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const p = await profileStore.getProfile();
      setProfile(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const equipItem = useCallback(async (slot: ItemSlot, itemId: string | null) => {
    const p = await profileStore.equipItem(slot, itemId);
    setProfile(p);
  }, []);

  const unlockItem = useCallback(async (itemId: string): Promise<boolean> => {
    const item = UNLOCKABLES.find((u) => u.id === itemId);
    if (!item || !profile) return false;
    if (profile.inventory.includes(itemId)) return true; // already owned
    if (profile.xp < item.costXp) return false;
    const requiredLevel = item.requiredLevel ?? 1;
    if (profile.level < requiredLevel) return false;
    try {
      const p = await profileStore.unlockItem(itemId, item.costXp);
      setProfile(p);
      return true;
    } catch {
      return false;
    }
  }, [profile]);

  const level = profile ? xpToLevel(profile.xp) : 1;
  const xpProgress = profile ? xpProgressToNextLevel(profile.xp) : { current: 0, needed: 50, pct: 0 };

  const value: ProfileContextType = {
    profile,
    loading,
    level,
    xpProgress,
    unlockables: UNLOCKABLES,
    equipItem,
    unlockItem,
    refresh,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
