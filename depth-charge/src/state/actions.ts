import type { ItemId, Meta, RunMode, RunState } from '../engine/types';

export interface AppState {
  meta: Meta;
  muted: boolean;
  run: RunState;
}

export type Action =
  | { type: 'START_RUN'; mode: RunMode; seed: string }
  | { type: 'GO_TITLE' }
  | { type: 'REVEAL'; idx: number }
  | { type: 'FLAG'; idx: number }
  | { type: 'TARGET'; idx: number }
  | { type: 'SET_FLAG_MODE'; on: boolean }
  | { type: 'ARM_ITEM'; item: ItemId }
  | { type: 'CANCEL_ARM' }
  | { type: 'USE_ITEM'; item: ItemId }
  | { type: 'DESCEND' }
  | { type: 'BUY'; item: ItemId }
  | { type: 'NEXT_FLOOR' }
  | { type: 'DISMISS_TOAST'; id: number }
  | { type: 'SET_MUTED'; muted: boolean };
