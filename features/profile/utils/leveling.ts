/**
 * Level and XP calculations
 */

// XP needed to reach each level (cumulative)
const XP_PER_LEVEL = [0, 50, 150, 300, 500, 750, 1100, 1500, 2000, 2600, 3300];

export function xpToLevel(xp: number): number {
  for (let l = XP_PER_LEVEL.length - 1; l >= 0; l--) {
    if (xp >= XP_PER_LEVEL[l]) return l + 1;
  }
  return 1;
}

export function xpForNextLevel(xp: number): number {
  const level = xpToLevel(xp);
  if (level >= XP_PER_LEVEL.length) return 0; // max level
  return XP_PER_LEVEL[level] - xp;
}

export function xpProgressToNextLevel(xp: number): { current: number; needed: number; pct: number } {
  const level = xpToLevel(xp);
  if (level >= XP_PER_LEVEL.length) {
    return { current: xp - XP_PER_LEVEL[level - 1], needed: 0, pct: 100 };
  }
  const start = XP_PER_LEVEL[level - 1];
  const end = XP_PER_LEVEL[level];
  const current = xp - start;
  const needed = end - start;
  const pct = Math.min(100, Math.round((current / needed) * 100));
  return { current, needed, pct };
}
