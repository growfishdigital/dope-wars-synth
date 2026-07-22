import type { BriefingId, FloorConfig, ItemDef, ItemId, Meta } from './types';

export const START_HP = 3;
export const MAX_HP_CAP = 6;
export const METRES_PER_FLOOR = 120;
/** At or below this depth a drift shows the new number; deeper, it shows "?". */
export const DRIFT_UNKNOWN_DEPTH = 8;

/**
 * Floor tuning. Hand-authored for depths 1–8, formula-driven beyond.
 * Columns are capped so the board always fits a phone width; rows carry
 * the escalation and overflow into vertical scrolling.
 */
const TABLE: Array<Omit<FloorConfig, 'depth' | 'metres' | 'fullClearBonus'>> = [
  { cols: 7, rows: 8, mines: 8, volatile: 0, drifters: 0 }, // 1  ~14%
  { cols: 7, rows: 9, mines: 11, volatile: 0, drifters: 0 }, // 2 ~17%
  { cols: 8, rows: 9, mines: 14, volatile: 0, drifters: 0 }, // 3 ~19%
  { cols: 8, rows: 10, mines: 17, volatile: 2, drifters: 0 }, // 4 ~21%
  { cols: 8, rows: 11, mines: 20, volatile: 3, drifters: 0 }, // 5 ~23%
  { cols: 9, rows: 11, mines: 24, volatile: 3, drifters: 1 }, // 6 ~24%
  { cols: 9, rows: 12, mines: 28, volatile: 4, drifters: 2 }, // 7 ~26%
  { cols: 9, rows: 13, mines: 31, volatile: 5, drifters: 2 }, // 8 ~26%
];

export function floorConfig(depth: number): FloorConfig {
  if (depth <= TABLE.length) {
    const t = TABLE[depth - 1];
    return {
      depth,
      ...t,
      fullClearBonus: 20 + depth * 8,
      metres: depth * METRES_PER_FLOOR,
    };
  }
  // Beyond the table: hold the board size, scale the threat.
  const extra = depth - TABLE.length;
  const cols = 9;
  const rows = 13;
  const mines = Math.min(31 + extra * 2, Math.floor(cols * rows * 0.3));
  const volatile = Math.min(5 + Math.floor(extra / 2), 9);
  const drifters = Math.min(2 + Math.floor(extra / 3), 4);
  return {
    depth,
    cols,
    rows,
    mines,
    volatile,
    drifters,
    fullClearBonus: 20 + depth * 8,
    metres: depth * METRES_PER_FLOOR,
  };
}

export const ITEMS: Record<ItemId, ItemDef> = {
  patch: {
    id: 'patch',
    name: 'Repair Patch',
    blurb: 'Seal a breach. Restore 1 hull.',
    glyph: '✚',
    basePrice: 26,
    priceScale: 1.45,
    kind: 'instant',
  },
  sonar: {
    id: 'sonar',
    name: 'Sonar Sweep',
    blurb: 'Ping a 3×3. Marks charges without triggering them.',
    glyph: '⊚',
    basePrice: 16,
    priceScale: 1.18,
    kind: 'targeted',
  },
  plating: {
    id: 'plating',
    name: 'Hull Plating',
    blurb: 'Reinforce the pod. +1 max hull (and repair it).',
    glyph: '▤',
    basePrice: 64,
    priceScale: 1.6,
    kind: 'instant',
  },
  defuser: {
    id: 'defuser',
    name: 'Defuser',
    blurb: 'Neutralise a flagged contact. Safe either way.',
    glyph: '⌀',
    basePrice: 32,
    priceScale: 1.25,
    kind: 'targeted',
    unlock: 'defuser',
  },
  transponder: {
    id: 'transponder',
    name: 'Transponder',
    blurb: 'Lock a beacon onto the exit hatch.',
    glyph: '◎',
    basePrice: 38,
    priceScale: 1.3,
    kind: 'instant',
    unlock: 'transponder',
  },
  ballast: {
    id: 'ballast',
    name: 'Emergency Ballast',
    blurb: 'Blow the tanks on the next hit — negate it once.',
    glyph: '◇',
    basePrice: 52,
    priceScale: 1.5,
    kind: 'passive',
    unlock: 'ballast',
  },
};

export const ITEM_ORDER: ItemId[] = [
  'patch',
  'sonar',
  'defuser',
  'transponder',
  'plating',
  'ballast',
];

/** Meta unlock milestones, checked at run's end against best depth reached. */
export const UNLOCK_AT_DEPTH: Record<'defuser' | 'transponder' | 'ballast', number> = {
  defuser: 4,
  transponder: 6,
  ballast: 8,
};

export function price(item: ItemDef, priorPurchases: number): number {
  return Math.round(item.basePrice * Math.pow(item.priceScale, priorPurchases));
}

export interface Briefing {
  id: BriefingId;
  depth: number;
  glyph: string;
  title: string;
  lines: string[];
}

/** New-mechanic briefings, shown once each when the player first reaches the depth. */
export const BRIEFINGS: Briefing[] = [
  {
    id: 'volatile',
    depth: 4,
    glyph: '✳',
    title: 'Volatile Charges',
    lines: [
      'The trench is deep enough now for volatile charges.',
      'Detonate one and it costs 2 hull instead of 1 — mind your integrity.',
    ],
  },
  {
    id: 'drift',
    depth: 6,
    glyph: '◇',
    title: 'Drifting Contacts',
    lines: [
      'Some charges now drift, relocating between your digs.',
      "When one moves you'll hear it and the affected readings pulse — re-check them before you trust them.",
    ],
  },
  {
    id: 'unknown',
    depth: 8,
    glyph: '?',
    title: 'Sonar Interference',
    lines: [
      'This deep, the pressure scrambles your sonar.',
      'When a charge drifts, the readings it disturbs go dark as “?” until your next dig re-locks them.',
    ],
  },
];

export function briefingForDepth(depth: number): Briefing | undefined {
  return BRIEFINGS.find((b) => b.depth === depth);
}

export function briefingById(id: BriefingId): Briefing | undefined {
  return BRIEFINGS.find((b) => b.id === id);
}

export function initialMeta(): Meta {
  return {
    bestDepth: 0,
    bestSalvage: 0,
    totalDives: 0,
    totalReveals: 0,
    totalHits: 0,
    fullClears: 0,
    unlocks: { defuser: false, transponder: false, ballast: false },
    seenBriefings: {},
    daily: { lastDate: null, bestDepthByDate: {} },
  };
}
