import type { Meta } from '../engine/types';
import { initialMeta } from '../engine/config';

const META_KEY = 'depth-charge/meta';
const MUTED_KEY = 'depth-charge/muted';

export function loadMeta(): Meta {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return initialMeta();
    const parsed = JSON.parse(raw) as Partial<Meta>;
    const base = initialMeta();
    return {
      ...base,
      ...parsed,
      unlocks: { ...base.unlocks, ...(parsed.unlocks ?? {}) },
      daily: {
        lastDate: parsed.daily?.lastDate ?? null,
        bestDepthByDate: parsed.daily?.bestDepthByDate ?? {},
      },
    };
  } catch {
    return initialMeta();
  }
}

export function saveMeta(meta: Meta): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* storage unavailable — meta simply won't persist */
  }
}

export function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTED_KEY, muted ? '1' : '0');
  } catch {
    /* ignore */
  }
}

/** Today's date as a UTC YYYY-MM-DD string, for the daily seed. */
export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}
