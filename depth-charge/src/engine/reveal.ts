import type { Board, RevealResult } from './types';
import { neighbors, recomputeAdj } from './board';
import { makeRng } from './rng';

function emptyResult(): RevealResult {
  return { revealed: [], hits: [], exitFound: false, fullClear: false };
}

/** Reveal a single cell. Mutates the board. Handles detonation and zero-flood. */
export function revealCell(board: Board, idx: number): RevealResult {
  const res = emptyResult();
  const cell = board.cells[idx];
  if (cell.revealed || cell.flagged) return res;

  if (cell.mine > 0) {
    res.hits.push({ idx, kind: cell.mine });
    cell.detonated = true;
    cell.revealed = true;
    cell.scanned = false;
    cell.mine = 0;
    board.minesLeft = Math.max(0, board.minesLeft - 1);
    recomputeAdj(board);
    if (cell.exit) {
      res.exitFound = true;
      board.exitRevealed = true;
    }
    return res;
  }

  // Safe: iterative flood fill.
  const stack = [idx];
  while (stack.length) {
    const cur = stack.pop()!;
    const c = board.cells[cur];
    if (c.revealed || c.flagged || c.mine > 0) continue;
    c.revealed = true;
    c.scanned = false;
    board.safeLeft = Math.max(0, board.safeLeft - 1);
    res.revealed.push(cur);
    if (c.exit) {
      res.exitFound = true;
      board.exitRevealed = true;
    }
    if (c.adj === 0) {
      for (const nb of neighbors(board, cur)) {
        const nc = board.cells[nb];
        if (!nc.revealed && !nc.flagged && nc.mine === 0) stack.push(nb);
      }
    }
  }

  if (board.safeLeft === 0) res.fullClear = true;
  return res;
}

/**
 * Chord on a revealed number: if the flags around it match its count, reveal
 * every un-flagged neighbour (which may detonate mis-flagged charges).
 */
export function chord(board: Board, idx: number): RevealResult {
  const res = emptyResult();
  const cell = board.cells[idx];
  if (!cell.revealed || cell.adj === 0) return res;

  const nbrs = neighbors(board, idx);
  const flagged = nbrs.filter((n) => board.cells[n].flagged).length;
  if (flagged !== cell.adj) return res;

  for (const n of nbrs) {
    const nc = board.cells[n];
    if (nc.revealed || nc.flagged) continue;
    const sub = revealCell(board, n);
    res.revealed.push(...sub.revealed);
    res.hits.push(...sub.hits);
    if (sub.exitFound) res.exitFound = true;
    if (sub.fullClear) res.fullClear = true;
  }
  return res;
}

/** Toggle a flag on a hidden cell. Returns true if the flag was placed. */
export function toggleFlag(board: Board, idx: number): boolean {
  const cell = board.cells[idx];
  if (cell.revealed) return false;
  cell.flagged = !cell.flagged;
  board.flags += cell.flagged ? 1 : -1;
  return cell.flagged;
}

/** Sonar sweep: mark a 3×3 as scanned so the UI can hint at charges. */
export function applySonar(board: Board, idx: number): void {
  const cells = [idx, ...neighbors(board, idx)];
  for (const i of cells) {
    if (!board.cells[i].revealed) board.cells[i].scanned = true;
  }
}

/**
 * Defuser on a flagged cell. If it hid a charge, neutralise it cleanly (no
 * damage). If it was a mis-flag over a safe cell, reveal it safely instead.
 */
export function applyDefuser(board: Board, idx: number): RevealResult {
  const res = emptyResult();
  const cell = board.cells[idx];
  if (!cell.flagged) return res;

  cell.flagged = false;
  board.flags = Math.max(0, board.flags - 1);

  if (cell.mine > 0) {
    cell.mine = 0;
    cell.defused = true;
    cell.revealed = true;
    board.minesLeft = Math.max(0, board.minesLeft - 1);
    recomputeAdj(board);
    if (cell.exit) {
      res.exitFound = true;
      board.exitRevealed = true;
    }
    return res;
  }

  // Mis-flag over safe ground — reveal it so the charge is never wasted.
  return revealCell(board, idx);
}

/** Transponder: point a beacon at the (still-hidden) exit hatch. */
export function applyTransponder(board: Board): void {
  if (board.exitIdx >= 0 && !board.cells[board.exitIdx].revealed) {
    board.cells[board.exitIdx].beacon = true;
  }
}

export interface DriftResult {
  moved: boolean;
  /** Indices of revealed readings whose number changed as a result. */
  changed: number[];
}

/**
 * Drifters wander. After a reveal action, each drifter charge may slip to an
 * adjacent hidden, un-flagged, charge-free, non-exit cell. Deterministic given
 * the run seed, depth and action index — no RNG state to persist. Reports which
 * already-revealed readings changed so the UI can telegraph the disturbance.
 */
export function driftCharges(
  board: Board,
  seed: string,
  depth: number,
  action: number,
): DriftResult {
  const rng = makeRng(seed, depth, action, 'drift');
  let moved = false;
  const drifters: number[] = [];
  for (let i = 0; i < board.cells.length; i++) {
    if (board.cells[i].mine === 3 && !board.cells[i].revealed) drifters.push(i);
  }

  const before = board.cells.map((c) => c.adj);

  for (const from of drifters) {
    if (rng() > 0.28) continue; // most turns, they hold
    const targets = neighbors(board, from).filter((n) => {
      const c = board.cells[n];
      return !c.revealed && !c.flagged && c.mine === 0 && !c.exit;
    });
    if (targets.length === 0) continue;
    const to = targets[Math.floor(rng() * targets.length)];
    board.cells[to].mine = 3;
    board.cells[from].mine = 0;
    moved = true;
  }

  const changed: number[] = [];
  if (moved) {
    recomputeAdj(board);
    for (let i = 0; i < board.cells.length; i++) {
      const c = board.cells[i];
      if (c.revealed && c.mine === 0 && !c.detonated && !c.exit && c.adj !== before[i]) {
        c.drifted = true;
        changed.push(i);
      }
    }
  }
  return { moved, changed };
}

/** Clear the transient "just drifted" markers (called when the player next digs). */
export function clearDrifted(board: Board): void {
  for (const c of board.cells) c.drifted = false;
}
