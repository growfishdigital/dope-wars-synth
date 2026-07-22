import type { AppState, Action } from './actions';
import type { ItemId, RunState } from '../engine/types';
import {
  floorConfig,
  initialMeta,
  price,
  ITEMS,
  START_HP,
  MAX_HP_CAP,
} from '../engine/config';
import { makeBoard, armBoard, cloneBoard } from '../engine/board';
import {
  revealCell,
  chord,
  toggleFlag,
  applySonar,
  applyDefuser,
  applyTransponder,
  driftCharges,
} from '../engine/reveal';
import { makeRng } from '../engine/rng';
import {
  salvageForReveal,
  exitBonus,
  settleMeta,
} from '../engine/economy';
import type { Board, Meta, RevealResult, RunMode, SfxKind } from '../engine/types';

let toastSeq = 1;
let sfxSeq = 1;

function sfx(run: RunState, kind: SfxKind, extra: { n?: number; streak?: number } = {}): void {
  run.sfx = { id: sfxSeq++, kind, ...extra };
}

function freshInventory(): Record<ItemId, number> {
  return { patch: 0, sonar: 0, plating: 0, defuser: 0, transponder: 0, ballast: 0 };
}

function freshPurchases(): Record<ItemId, number> {
  return { patch: 0, sonar: 0, plating: 0, defuser: 0, transponder: 0, ballast: 0 };
}

function makeRun(mode: RunMode, seed: string): RunState {
  const cfg = floorConfig(1);
  return {
    screen: 'run',
    mode,
    seed,
    actions: 0,
    depth: 1,
    hp: START_HP,
    maxHp: START_HP,
    salvage: 0,
    streak: 0,
    bestStreak: 0,
    inventory: freshInventory(),
    ballastCharged: false,
    armedItem: null,
    flagMode: false,
    exitFound: false,
    purchases: freshPurchases(),
    board: makeBoard(cfg, seed),
    floorSalvage: 0,
    jolt: 0,
    alarm: 0,
    toast: null,
    sfx: null,
    over: null,
    newUnlocks: [],
  };
}

function idleRun(): RunState {
  const r = makeRun('free', 'idle');
  r.screen = 'title';
  return r;
}

export function initialState(meta: Meta, muted: boolean): AppState {
  return { meta: meta ?? initialMeta(), muted, run: idleRun() };
}

type Tone = 'info' | 'good' | 'bad' | 'gold';
function toast(run: RunState, text: string, tone: Tone): void {
  run.toast = { id: toastSeq++, text, tone };
}

function damageForHits(hits: RevealResult['hits']): number {
  return hits.reduce((sum, h) => sum + (h.kind === 2 ? 2 : 1), 0);
}

/** Apply a reveal/chord result to a cloned run + board, returning the new state. */
function applyResult(
  state: AppState,
  run: RunState,
  board: Board,
  res: RevealResult,
): AppState {
  run.actions += 1;

  // Salvage from safe reveals, scaled by streak.
  const gained = salvageForReveal(res.revealed.length, run.streak + (res.hits.length ? 0 : 1));
  run.salvage += gained;

  // Damage, with a chance for Emergency Ballast to negate the whole action.
  let dmg = damageForHits(res.hits);
  const hadBig = res.hits.some((h) => h.kind === 2);
  let ballastFired = false;
  if (dmg > 0 && run.inventory.ballast > 0) {
    run.inventory.ballast -= 1;
    run.ballastCharged = run.inventory.ballast > 0;
    toast(run, 'Ballast blown — hit negated', 'good');
    dmg = 0;
    ballastFired = true;
  }
  if (res.hits.length > 0) {
    run.streak = 0;
    if (dmg > 0) {
      run.hp = Math.max(0, run.hp - dmg);
      run.jolt += 1;
      run.alarm += 1;
    }
  } else if (res.revealed.length > 0) {
    run.streak += 1;
    run.bestStreak = Math.max(run.bestStreak, run.streak);
  }

  // Exit hatch located (bonus once).
  const newExit = res.exitFound && !run.exitFound;
  if (newExit) {
    run.exitFound = true;
    const bonus = exitBonus(run.depth);
    run.salvage += bonus;
    toast(run, `Exit hatch located · +${bonus} salvage`, 'good');
  }

  // Full clear bonus.
  if (res.fullClear) {
    const cfg = floorConfig(run.depth);
    run.salvage += cfg.fullClearBonus;
    toast(run, `Sector cleared · +${cfg.fullClearBonus} salvage`, 'gold');
  }

  // Pick the single most salient sound for this action.
  if (res.fullClear) sfx(run, 'clear');
  else if (newExit) sfx(run, 'hatch');
  else if (dmg > 0) sfx(run, hadBig ? 'boomBig' : 'boom');
  else if (ballastFired) sfx(run, 'ballast');
  else if (res.revealed.length > 1) sfx(run, 'flood', { n: res.revealed.length, streak: run.streak });
  else if (res.revealed.length === 1) sfx(run, 'reveal', { streak: run.streak });

  // Drifters wander after the action settles (if the floor has any, and we live).
  if (run.hp > 0) {
    const cfg = floorConfig(run.depth);
    if (cfg.drifters > 0) driftCharges(board, run.seed, run.depth, run.actions);
  }

  run.board = board;

  // Death.
  if (run.hp <= 0) {
    return endRun(state, run, 'Hull breached');
  }

  return { ...state, run };
}

function endRun(state: AppState, run: RunState, cause: string): AppState {
  const date = run.mode === 'daily' ? run.seed.replace('daily-', '') : '';
  const { meta, newUnlocks } = settleMeta(state.meta, {
    mode: run.mode,
    depthReached: run.depth,
    salvage: run.salvage,
    reveals: run.board.cells.filter((c) => c.revealed && !c.detonated).length,
    hits: run.board.cells.filter((c) => c.detonated).length,
    fullClears: run.board.safeLeft === 0 ? 1 : 0,
    date,
  });
  run.screen = 'gameover';
  run.over = { depth: run.depth, salvage: run.salvage, cause };
  run.newUnlocks = newUnlocks;
  return { ...state, meta, run };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_RUN': {
      return { ...state, run: makeRun(action.mode, action.seed) };
    }

    case 'GO_TITLE': {
      const run = idleRun();
      return { ...state, run };
    }

    case 'SET_FLAG_MODE': {
      return { ...state, run: { ...state.run, flagMode: action.on, armedItem: null } };
    }

    case 'DISMISS_TOAST': {
      if (!state.run.toast || state.run.toast.id !== action.id) return state;
      return { ...state, run: { ...state.run, toast: null } };
    }

    case 'ARM_ITEM': {
      const run = state.run;
      if (run.screen !== 'run' || !run.board.armed) return state;
      if (run.inventory[action.item] <= 0) return state;
      const same = run.armedItem === action.item;
      return { ...state, run: { ...run, armedItem: same ? null : action.item, flagMode: false } };
    }

    case 'CANCEL_ARM': {
      return { ...state, run: { ...state.run, armedItem: null } };
    }

    case 'USE_ITEM': {
      const run = { ...state.run, inventory: { ...state.run.inventory } };
      if (run.screen !== 'run' || !run.board.armed) return state;
      const item = action.item;
      if (run.inventory[item] <= 0) return state;

      if (item === 'patch') {
        if (run.hp >= run.maxHp) {
          toast(run, 'Hull already at full integrity', 'info');
          return { ...state, run };
        }
        run.hp = Math.min(run.maxHp, run.hp + 1);
        run.inventory.patch -= 1;
        sfx(run, 'buy');
        toast(run, 'Breach sealed · +1 hull', 'good');
        return { ...state, run };
      }
      if (item === 'plating') {
        if (run.maxHp >= MAX_HP_CAP) {
          toast(run, 'Hull already fully reinforced', 'info');
          return { ...state, run };
        }
        run.maxHp = Math.min(MAX_HP_CAP, run.maxHp + 1);
        run.hp += 1;
        run.inventory.plating -= 1;
        sfx(run, 'buy');
        toast(run, 'Plating fitted · +1 max hull', 'good');
        return { ...state, run };
      }
      if (item === 'transponder') {
        const board = cloneBoard(run.board);
        applyTransponder(board);
        run.board = board;
        run.inventory.transponder -= 1;
        sfx(run, 'sonar');
        toast(run, 'Beacon locked onto the exit', 'good');
        return { ...state, run };
      }
      return state;
    }

    case 'TARGET': {
      const run = { ...state.run, inventory: { ...state.run.inventory }, board: state.run.board };
      if (run.screen !== 'run' || !run.armedItem || !run.board.armed) return state;
      const board = cloneBoard(run.board);
      const item = run.armedItem;

      if (item === 'sonar') {
        applySonar(board, action.idx);
        run.inventory.sonar -= 1;
        run.armedItem = null;
        run.board = board;
        sfx(run, 'sonar');
        toast(run, 'Sonar sweep complete', 'info');
        return { ...state, run };
      }
      if (item === 'defuser') {
        if (!board.cells[action.idx].flagged) {
          toast(run, 'Defuser needs a flagged contact', 'info');
          run.armedItem = null;
          return { ...state, run };
        }
        const res = applyDefuser(board, action.idx);
        run.inventory.defuser -= 1;
        run.armedItem = null;
        const defusedCharge = board.cells[action.idx].defused;
        toast(run, defusedCharge ? 'Contact defused' : 'All clear — no charge', 'good');
        const out = applyResult(state, run, board, res);
        sfx(out.run, 'defuse');
        return out;
      }
      return state;
    }

    case 'FLAG': {
      const run = state.run;
      if (run.screen !== 'run') return state;
      const cell = run.board.cells[action.idx];
      if (cell.revealed) return state;
      const board = cloneBoard(run.board);
      const placed = toggleFlag(board, action.idx);
      const next = { ...run, board };
      sfx(next, placed ? 'flag' : 'unflag');
      return { ...state, run: next };
    }

    case 'REVEAL': {
      const run0 = state.run;
      if (run0.screen !== 'run') return state;
      const run = { ...run0 };
      const cell = run.board.cells[action.idx];

      // Tapping a revealed number chords.
      if (cell.revealed) {
        const board = cloneBoard(run.board);
        const res = chord(board, action.idx);
        if (res.revealed.length === 0 && res.hits.length === 0) return state;
        return applyResult(state, run, board, res);
      }

      if (cell.flagged) return state;

      const board = cloneBoard(run.board);
      if (!board.armed) {
        const cfg = floorConfig(run.depth);
        armBoard(board, cfg, action.idx, makeRng(run.seed, run.depth, action.idx));
      }
      const res = revealCell(board, action.idx);
      return applyResult(state, run, board, res);
    }

    case 'DESCEND': {
      const run = state.run;
      if (run.screen !== 'run' || !run.exitFound) return state;
      const shopRun = { ...run, screen: 'shop' as const, floorSalvage: run.salvage, armedItem: null, toast: null };
      sfx(shopRun, 'descend');
      return { ...state, run: shopRun };
    }

    case 'BUY': {
      const run = { ...state.run, inventory: { ...state.run.inventory }, purchases: { ...state.run.purchases } };
      if (run.screen !== 'shop') return state;
      const def = ITEMS[action.item];
      const cost = price(def, run.purchases[action.item]);
      if (run.salvage < cost) {
        sfx(run, 'error');
        toast(run, 'Not enough salvage', 'bad');
        return { ...state, run };
      }
      run.salvage -= cost;
      run.purchases[action.item] += 1;
      sfx(run, 'buy');

      if (action.item === 'patch') {
        run.hp = Math.min(run.maxHp, run.hp + 1);
        toast(run, 'Hull repaired · +1', 'good');
      } else if (action.item === 'plating') {
        run.maxHp = Math.min(MAX_HP_CAP, run.maxHp + 1);
        run.hp += 1;
        toast(run, 'Plating fitted · +1 max hull', 'good');
      } else {
        run.inventory[action.item] += 1;
        run.ballastCharged = run.inventory.ballast > 0;
        toast(run, `${def.name} stowed`, 'good');
      }
      return { ...state, run };
    }

    case 'NEXT_FLOOR': {
      const run = state.run;
      if (run.screen !== 'shop') return state;
      const depth = run.depth + 1;
      const cfg = floorConfig(depth);
      return {
        ...state,
        run: {
          ...run,
          screen: 'run',
          depth,
          board: makeBoard(cfg, run.seed),
          streak: 0,
          exitFound: false,
          armedItem: null,
          flagMode: false,
          toast: null,
          jolt: 0,
          alarm: 0,
        },
      };
    }

    case 'SET_MUTED': {
      return { ...state, muted: action.muted };
    }

    default:
      return state;
  }
}
