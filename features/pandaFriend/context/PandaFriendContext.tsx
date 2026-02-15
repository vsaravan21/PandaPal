/**
 * Panda Friend context - profile, panda state, equip actions
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useProfile } from '@/features/profile/context/ProfileContext';
import type { PandaFriendState } from '../types';
import * as pandaFriendStore from '../storage/pandaFriendStore';
import { xpToLevel } from '@/features/profile/utils/leveling';

function growthStage(level: number): string {
  if (level >= 5) return 'Hero';
  if (level >= 4) return 'Explorer';
  if (level >= 3) return 'Adventurer';
  if (level >= 2) return 'Sprout';
  return 'Seedling';
}

type PandaFriendContextType = {
  panda: PandaFriendState | null;
  profile: ReturnType<typeof useProfile>['profile'];
  level: number;
  growthStageLabel: string;
  xpProgress: { current: number; needed: number; pct: number };
  adventuresCompleted: number;
  loading: boolean;
  refresh: () => Promise<void>;
  setPandaName: (name: string) => Promise<void>;
  equipHat: (id: string | null) => Promise<void>;
  equipGlasses: (id: string | null) => Promise<void>;
  equipOutfit: (id: string | null) => Promise<void>;
  equipAccessory: (id: string | null) => Promise<void>;
  equipBackground: (id: string | null) => Promise<void>;
  setDecorSlot: (index: 0 | 1 | 2, id: string | null) => Promise<void>;
  syncAdventuresFromLessons: (count: number) => Promise<void>;
};

const PandaFriendContext = createContext<PandaFriendContextType | null>(null);

export function PandaFriendProvider({ children }: { children: React.ReactNode }) {
  const profileCtx = useProfile();
  const { profile, equipItem: profileEquipItem, xpProgress } = profileCtx;
  const [panda, setPanda] = useState<PandaFriendState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const pf = await pandaFriendStore.loadPandaFriend();
      setPanda(pf);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setPandaName = useCallback(async (name: string) => {
    await pandaFriendStore.setPandaName(name);
    const pf = await pandaFriendStore.loadPandaFriend();
    setPanda(pf);
  }, []);

  const equipHat = useCallback(async (id: string | null) => {
    await profileCtx.equipItem('hat', id);
  }, [profileCtx]);

  const equipGlasses = useCallback(async (id: string | null) => {
    await pandaFriendStore.setEquippedGlasses(id);
    const pf = await pandaFriendStore.loadPandaFriend();
    setPanda(pf);
  }, []);

  const equipOutfit = useCallback(async (id: string | null) => {
    await profileCtx.equipItem('shirt', id);
  }, [profileCtx]);

  const equipAccessory = useCallback(async (id: string | null) => {
    await profileCtx.equipItem('accessory', id);
  }, [profileCtx]);

  const equipBackground = useCallback(async (id: string | null) => {
    await profileCtx.equipItem('background', id);
  }, [profileCtx]);

  const setDecorSlot = useCallback(async (index: 0 | 1 | 2, id: string | null) => {
    await pandaFriendStore.setDecorSlot(index, id);
    const pf = await pandaFriendStore.loadPandaFriend();
    setPanda(pf);
  }, []);

  const syncAdventuresFromLessons = useCallback(async (count: number) => {
    await pandaFriendStore.setAdventuresCount(count);
    const pf = await pandaFriendStore.loadPandaFriend();
    setPanda(pf);
  }, []);

  const level = profile ? xpToLevel(profile.xp) : 1;

  const value: PandaFriendContextType = {
    panda,
    profile: profileCtx.profile,
    level,
    growthStageLabel: growthStage(level),
    xpProgress: profileCtx.xpProgress,
    adventuresCompleted: panda?.adventuresCompleted ?? 0,
    loading,
    refresh,
    setPandaName,
    equipHat,
    equipGlasses,
    equipOutfit,
    equipAccessory,
    equipBackground,
    setDecorSlot,
    syncAdventuresFromLessons,
  };

  return (
    <PandaFriendContext.Provider value={value}>
      {children}
    </PandaFriendContext.Provider>
  );
}

export function usePandaFriend() {
  const ctx = useContext(PandaFriendContext);
  if (!ctx) throw new Error('usePandaFriend must be used within PandaFriendProvider');
  return ctx;
}
