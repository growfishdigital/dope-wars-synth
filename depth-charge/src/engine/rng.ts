// Deterministic, seedable RNG. Same seed → same sequence, on every platform.

/** FNV-ish string hash → uint32. */
export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

/** mulberry32 PRNG — returns a function yielding floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build a PRNG keyed on any combination of parts (joined deterministically). */
export function makeRng(...parts: Array<string | number>): () => number {
  return mulberry32(hashSeed(parts.join('|')));
}

/** In-place Fisher–Yates shuffle using the supplied PRNG. */
export function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/** A short, human-typable seed for a free dive. Caller supplies entropy. */
export function randomSeed(entropy: number): string {
  return Math.abs(Math.floor(entropy)).toString(36).slice(0, 8).padStart(4, '0');
}

/** The daily seed for a given UTC date (YYYY-MM-DD). */
export function dailySeed(date: string): string {
  return `daily-${date}`;
}
