import type { Board, Cell, FloorConfig, MineKind } from './types';
import { MINE_DRIFTER, MINE_STD, MINE_VOLATILE } from './types';
import { shuffle } from './rng';

function emptyCell(): Cell {
  return {
    mine: 0,
    adj: 0,
    revealed: false,
    flagged: false,
    exit: false,
    detonated: false,
    scanned: false,
    beacon: false,
    defused: false,
  };
}

export function makeBoard(cfg: FloorConfig, seed: string): Board {
  const cells: Cell[] = [];
  for (let i = 0; i < cfg.cols * cfg.rows; i++) cells.push(emptyCell());
  return {
    cols: cfg.cols,
    rows: cfg.rows,
    cells,
    armed: false,
    mineCount: cfg.mines,
    minesLeft: cfg.mines,
    flags: 0,
    exitIdx: -1,
    exitRevealed: false,
    safeLeft: cfg.cols * cfg.rows - cfg.mines,
    seed,
  };
}

export function neighbors(board: Board, idx: number): number[] {
  const { cols, rows } = board;
  const r = Math.floor(idx / cols);
  const c = idx % cols;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      out.push(nr * cols + nc);
    }
  }
  return out;
}

export function recomputeAdj(board: Board): void {
  for (let i = 0; i < board.cells.length; i++) {
    const cell = board.cells[i];
    if (cell.mine > 0) {
      cell.adj = 0;
      continue;
    }
    let n = 0;
    for (const nb of neighbors(board, i)) {
      if (board.cells[nb].mine > 0) n++;
    }
    cell.adj = n;
  }
}

/** Chebyshev (chessboard) distance between two indices. */
function chebyshev(board: Board, a: number, b: number): number {
  const { cols } = board;
  const ar = Math.floor(a / cols);
  const ac = a % cols;
  const br = Math.floor(b / cols);
  const bc = b % cols;
  return Math.max(Math.abs(ar - br), Math.abs(ac - bc));
}

/** Indices a reveal from `idx` would expose (classic zero-flood), without mutating. */
export function openingRegion(board: Board, idx: number): Set<number> {
  const seen = new Set<number>();
  if (board.cells[idx].mine > 0) return seen;
  const stack = [idx];
  while (stack.length) {
    const cur = stack.pop()!;
    if (seen.has(cur)) continue;
    const c = board.cells[cur];
    if (c.mine > 0) continue;
    seen.add(cur);
    if (c.adj === 0) {
      for (const nb of neighbors(board, cur)) {
        if (!seen.has(nb) && board.cells[nb].mine === 0) stack.push(nb);
      }
    }
  }
  return seen;
}

/**
 * Place charges (deferred until first reveal) with first-click safety, assign
 * special kinds, compute adjacency, then hide the exit hatch far from the start.
 */
export function armBoard(
  board: Board,
  cfg: FloorConfig,
  firstIdx: number,
  rng: () => number,
): void {
  const total = board.cols * board.rows;

  // First-click safety: exclude the clicked cell and its neighbours so the
  // opening is always a zero-flood. Shrink the exclusion if the board is too
  // dense to honour it (never happens with the tuning table, but stay safe).
  const safeZone = new Set<number>([firstIdx, ...neighbors(board, firstIdx)]);
  let candidates: number[] = [];
  for (let i = 0; i < total; i++) if (!safeZone.has(i)) candidates.push(i);
  if (candidates.length < cfg.mines) {
    candidates = [];
    for (let i = 0; i < total; i++) if (i !== firstIdx) candidates.push(i);
  }

  shuffle(candidates, rng);
  const chosen = candidates.slice(0, cfg.mines);

  chosen.forEach((idx, k) => {
    let kind: MineKind = MINE_STD;
    if (k < cfg.volatile) kind = MINE_VOLATILE;
    else if (k < cfg.volatile + cfg.drifters) kind = MINE_DRIFTER;
    board.cells[idx].mine = kind;
  });

  board.mineCount = cfg.mines;
  board.minesLeft = cfg.mines;
  board.safeLeft = total - cfg.mines;
  board.armed = true;
  recomputeAdj(board);
  placeExit(board, firstIdx, rng);
}

function placeExit(board: Board, firstIdx: number, rng: () => number): void {
  const opening = openingRegion(board, firstIdx);
  const maxDist = board.cols + board.rows; // generous upper bound

  const safeCells: number[] = [];
  for (let i = 0; i < board.cells.length; i++) {
    if (board.cells[i].mine === 0) safeCells.push(i);
  }

  // Prefer safe cells outside the opening region, biased far from the start.
  let pool = safeCells.filter((i) => !opening.has(i));
  if (pool.length === 0) pool = safeCells.filter((i) => i !== firstIdx);
  if (pool.length === 0) pool = safeCells;

  const threshold = Math.max(2, Math.floor(chebyshevFarBound(board, firstIdx) * 0.55));
  let far = pool.filter((i) => chebyshev(board, firstIdx, i) >= threshold);
  if (far.length === 0) far = pool;

  // Weight toward the farthest cells: sort by distance, take the top third.
  far.sort((a, b) => chebyshev(board, firstIdx, b) - chebyshev(board, firstIdx, a));
  const topN = Math.max(1, Math.floor(far.length / 3));
  const pick = far[Math.floor(rng() * topN)];

  board.cells[pick].exit = true;
  board.exitIdx = pick;
  void maxDist;
}

/** The largest Chebyshev distance any cell could have from `idx` on this board. */
function chebyshevFarBound(board: Board, idx: number): number {
  const corners = [0, board.cols - 1, (board.rows - 1) * board.cols, board.rows * board.cols - 1];
  return Math.max(...corners.map((c) => chebyshev(board, idx, c)));
}

/** Deep-clone a board (cells copied) so reducers stay pure. */
export function cloneBoard(board: Board): Board {
  return {
    ...board,
    cells: board.cells.map((c) => ({ ...c })),
  };
}
