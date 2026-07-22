import type { Meta, RunMode, UnlockId } from './types';
import { UNLOCK_AT_DEPTH } from './config';

/**
 * Salvage from a reveal action. Base 1 per safe cell, scaled by a streak
 * multiplier that rewards clearing without taking hits.
 */
export function salvageForReveal(revealedCount: number, streak: number): number {
  if (revealedCount === 0) return 0;
  const mult = 1 + Math.min(Math.floor(streak / 3), 4) * 0.5; // 1× … 3×
  return Math.round(revealedCount * mult);
}

export function streakMultiplier(streak: number): number {
  return 1 + Math.min(Math.floor(streak / 3), 4) * 0.5;
}

/** Bonus for uncovering the exit hatch. */
export function exitBonus(depth: number): number {
  return 5 + depth * 2;
}

/** Update meta at the end of a dive; return any newly earned unlocks. */
export function settleMeta(
  meta: Meta,
  opts: {
    mode: RunMode;
    depthReached: number;
    salvage: number;
    reveals: number;
    hits: number;
    fullClears: number;
    date: string;
  },
): { meta: Meta; newUnlocks: UnlockId[] } {
  const next: Meta = {
    ...meta,
    unlocks: { ...meta.unlocks },
    daily: {
      lastDate: meta.daily.lastDate,
      bestDepthByDate: { ...meta.daily.bestDepthByDate },
    },
  };

  next.bestDepth = Math.max(next.bestDepth, opts.depthReached);
  next.bestSalvage = Math.max(next.bestSalvage, opts.salvage);
  next.totalDives += 1;
  next.totalReveals += opts.reveals;
  next.totalHits += opts.hits;
  next.fullClears += opts.fullClears;

  if (opts.mode === 'daily') {
    next.daily.lastDate = opts.date;
    const prev = next.daily.bestDepthByDate[opts.date] ?? 0;
    next.daily.bestDepthByDate[opts.date] = Math.max(prev, opts.depthReached);
  }

  const newUnlocks: UnlockId[] = [];
  (Object.keys(UNLOCK_AT_DEPTH) as UnlockId[]).forEach((id) => {
    if (!next.unlocks[id] && next.bestDepth >= UNLOCK_AT_DEPTH[id]) {
      next.unlocks[id] = true;
      newUnlocks.push(id);
    }
  });

  return { meta: next, newUnlocks };
}
