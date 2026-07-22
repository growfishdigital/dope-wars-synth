// Core game types. Pure data — no React, no DOM.

/** 0 = no charge. 1 = standard charge. 2 = volatile (2 damage). 3 = drifter (moves). */
export type MineKind = 0 | 1 | 2 | 3;

export const MINE_STD: MineKind = 1;
export const MINE_VOLATILE: MineKind = 2;
export const MINE_DRIFTER: MineKind = 3;

export interface Cell {
  /** Charge under this cell, if any. */
  mine: MineKind;
  /** Count of neighbouring cells that currently hold a charge. */
  adj: number;
  revealed: boolean;
  flagged: boolean;
  /** The exit hatch is beneath this cell. */
  exit: boolean;
  /** A charge that has already detonated (shown as a wreck). */
  detonated: boolean;
  /** Sonar hint applied — UI may surface a proximity read without revealing. */
  scanned: boolean;
  /** Transponder beacon points here (the exit). */
  beacon: boolean;
  /** Cleanly defused charge (shown distinct from a detonation). */
  defused: boolean;
}

export interface Board {
  cols: number;
  rows: number;
  cells: Cell[];
  /** Have charges been placed? Deferred until the first reveal. */
  armed: boolean;
  mineCount: number;
  /** Active (undetonated, undefused) charges remaining. */
  minesLeft: number;
  flags: number;
  /** Index of the hidden exit hatch, or -1 before arming. */
  exitIdx: number;
  exitRevealed: boolean;
  /** Unrevealed safe cells remaining (full-clear when 0). */
  safeLeft: number;
  seed: string;
}

export interface Hit {
  idx: number;
  kind: MineKind;
}

/** The consequence of a reveal/chord, consumed by the run layer. */
export interface RevealResult {
  revealed: number[];
  hits: Hit[];
  exitFound: boolean;
  fullClear: boolean;
}

export type ItemId =
  | 'patch'
  | 'sonar'
  | 'plating'
  | 'defuser'
  | 'transponder'
  | 'ballast';

export type UnlockId = 'defuser' | 'ballast' | 'transponder';

export interface ItemDef {
  id: ItemId;
  name: string;
  blurb: string;
  glyph: string;
  basePrice: number;
  /** Price multiplier applied per prior purchase of this item, this run. */
  priceScale: number;
  kind: 'instant' | 'targeted' | 'passive';
  /** Requires a meta unlock before it appears in the shop pool. */
  unlock?: UnlockId;
}

export interface FloorConfig {
  depth: number;
  cols: number;
  rows: number;
  mines: number;
  volatile: number;
  drifters: number;
  fullClearBonus: number;
  /** Metres of depth this floor represents (for the gauge). */
  metres: number;
}

export type Screen = 'title' | 'run' | 'shop' | 'gameover';
export type RunMode = 'free' | 'daily';

export interface Meta {
  bestDepth: number;
  bestSalvage: number;
  totalDives: number;
  totalReveals: number;
  totalHits: number;
  fullClears: number;
  unlocks: Record<UnlockId, boolean>;
  daily: {
    lastDate: string | null;
    bestDepthByDate: Record<string, number>;
  };
}

export interface RunState {
  screen: Screen;
  mode: RunMode;
  seed: string;
  /** Monotonic action counter — seeds deterministic drift without persisting RNG state. */
  actions: number;
  depth: number;
  hp: number;
  maxHp: number;
  salvage: number;
  /** Consecutive safe reveal actions without taking a hit. */
  streak: number;
  bestStreak: number;
  inventory: Record<ItemId, number>;
  ballastCharged: boolean;
  /** A targeted item awaiting a board tap, or null. */
  armedItem: ItemId | null;
  flagMode: boolean;
  exitFound: boolean;
  /** Purchases per item this run, for price scaling. */
  purchases: Record<ItemId, number>;
  board: Board;
  /** Salvage banked at the moment the exit was found (for the shop summary). */
  floorSalvage: number;
  jolt: number;
  alarm: number;
  toast: Toast | null;
  sfx: SfxCue | null;
  over: { depth: number; salvage: number; cause: string } | null;
  newUnlocks: UnlockId[];
}

export interface Toast {
  id: number;
  text: string;
  tone: 'info' | 'good' | 'bad' | 'gold';
}

export type SfxKind =
  | 'reveal'
  | 'flood'
  | 'boom'
  | 'boomBig'
  | 'hatch'
  | 'clear'
  | 'descend'
  | 'flag'
  | 'unflag'
  | 'sonar'
  | 'defuse'
  | 'buy'
  | 'ballast'
  | 'error';

export interface SfxCue {
  id: number;
  kind: SfxKind;
  n?: number;
  streak?: number;
}
