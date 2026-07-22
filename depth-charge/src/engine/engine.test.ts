import { describe, it, expect } from 'vitest';
import { makeBoard, armBoard, neighbors, openingRegion, cloneBoard } from './board';
import { revealCell, chord, toggleFlag, applyDefuser, driftCharges, clearDrifted } from './reveal';
import { floorConfig } from './config';
import { makeRng, hashSeed, mulberry32 } from './rng';
import type { Board } from './types';

function armedBoard(seed: string, depth: number, firstIdx: number): Board {
  const cfg = floorConfig(depth);
  const board = makeBoard(cfg, seed);
  const rng = makeRng(seed, depth, firstIdx);
  armBoard(board, cfg, firstIdx, rng);
  return board;
}

function countMines(board: Board): number {
  return board.cells.filter((c) => c.mine > 0).length;
}

describe('rng', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(hashSeed('abc'));
    const b = mulberry32(hashSeed('abc'));
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('differs across seeds', () => {
    const a = mulberry32(hashSeed('abc'))();
    const b = mulberry32(hashSeed('abd'))();
    expect(a).not.toEqual(b);
  });
});

describe('board arming — first-click safety', () => {
  it('never places a charge on the first click or its neighbours', () => {
    for (let depth = 1; depth <= 10; depth++) {
      for (let trial = 0; trial < 20; trial++) {
        const cfg = floorConfig(depth);
        const first = Math.floor((trial * 37 + depth * 13) % (cfg.cols * cfg.rows));
        const board = armedBoard(`seed-${depth}-${trial}`, depth, first);
        expect(board.cells[first].mine).toBe(0);
        for (const n of neighbors(board, first)) {
          expect(board.cells[n].mine).toBe(0);
        }
      }
    }
  });

  it('places exactly the configured number of charges', () => {
    for (let depth = 1; depth <= 12; depth++) {
      const cfg = floorConfig(depth);
      const board = armedBoard(`count-${depth}`, depth, 0);
      expect(countMines(board)).toBe(cfg.mines);
      expect(board.mineCount).toBe(cfg.mines);
      expect(board.minesLeft).toBe(cfg.mines);
    }
  });

  it('assigns the right number of special charges', () => {
    const cfg = floorConfig(8);
    const board = armedBoard('specials', 8, 0);
    const volatile = board.cells.filter((c) => c.mine === 2).length;
    const drifters = board.cells.filter((c) => c.mine === 3).length;
    expect(volatile).toBe(cfg.volatile);
    expect(drifters).toBe(cfg.drifters);
  });
});

describe('adjacency', () => {
  it('every safe cell counts its mined neighbours exactly', () => {
    const board = armedBoard('adj', 5, 20);
    for (let i = 0; i < board.cells.length; i++) {
      const cell = board.cells[i];
      if (cell.mine > 0) continue;
      const actual = neighbors(board, i).filter((n) => board.cells[n].mine > 0).length;
      expect(cell.adj).toBe(actual);
    }
  });
});

describe('exit hatch', () => {
  it('sits on a safe cell and is set', () => {
    for (let depth = 1; depth <= 10; depth++) {
      const board = armedBoard(`exit-${depth}`, depth, 5);
      expect(board.exitIdx).toBeGreaterThanOrEqual(0);
      expect(board.cells[board.exitIdx].exit).toBe(true);
      expect(board.cells[board.exitIdx].mine).toBe(0);
    }
  });

  it('is usually outside the first-click opening region', () => {
    // Not a hard guarantee (tiny boards can fully open) but should hold broadly.
    let outside = 0;
    const trials = 30;
    for (let t = 0; t < trials; t++) {
      const first = 3;
      const board = armedBoard(`exit-region-${t}`, 4, first);
      const opening = openingRegion(board, first);
      if (!opening.has(board.exitIdx)) outside++;
    }
    expect(outside).toBeGreaterThan(trials * 0.7);
  });
});

describe('determinism', () => {
  it('same seed + same first click → identical board', () => {
    const a = armedBoard('dup', 6, 12);
    const b = armedBoard('dup', 6, 12);
    expect(a.cells.map((c) => c.mine)).toEqual(b.cells.map((c) => c.mine));
    expect(a.exitIdx).toBe(b.exitIdx);
  });
});

describe('reveal & flood', () => {
  it('first click opens a multi-cell region (zero-flood)', () => {
    const board = armedBoard('flood', 3, 10);
    const res = revealCell(board, 10);
    expect(res.revealed.length).toBeGreaterThan(1);
    expect(board.cells[10].revealed).toBe(true);
  });

  it('detonation neutralises the charge and drops neighbour numbers', () => {
    const board = armedBoard('boom', 5, 0);
    const mineIdx = board.cells.findIndex((c) => c.mine === 1);
    const before = neighbors(board, mineIdx)
      .filter((n) => board.cells[n].mine === 0)
      .map((n) => board.cells[n].adj);
    const res = revealCell(board, mineIdx);
    expect(res.hits.length).toBe(1);
    expect(board.cells[mineIdx].detonated).toBe(true);
    expect(board.cells[mineIdx].mine).toBe(0);
    expect(board.minesLeft).toBe(board.mineCount - 1);
    const after = neighbors(board, mineIdx)
      .filter((n) => board.cells[n].mine === 0)
      .map((n) => board.cells[n].adj);
    // Each safe neighbour's count should be one lower than before (or equal if it was already counting other mines only).
    after.forEach((v, k) => expect(v).toBe(before[k] - 1));
  });

  it('flagged cells are protected from reveal', () => {
    const board = armedBoard('flagprotect', 4, 0);
    const mineIdx = board.cells.findIndex((c) => c.mine > 0);
    toggleFlag(board, mineIdx);
    const res = revealCell(board, mineIdx);
    expect(res.hits.length).toBe(0);
    expect(board.cells[mineIdx].revealed).toBe(false);
  });
});

describe('chording', () => {
  it('reveals neighbours when flags match the number', () => {
    const board = armedBoard('chord', 4, 0);
    // Reveal from a safe spot to expose some numbers.
    revealCell(board, 0);
    const numbered = board.cells.findIndex(
      (c, i) => c.revealed && c.adj > 0 && neighbors(board, i).some((n) => board.cells[n].mine > 0),
    );
    if (numbered < 0) return; // nothing to chord this layout
    // Flag exactly the mined neighbours.
    for (const n of neighbors(board, numbered)) {
      if (board.cells[n].mine > 0) toggleFlag(board, n);
    }
    const res = chord(board, numbered);
    // No hits since we flagged the actual charges.
    expect(res.hits.length).toBe(0);
  });
});

describe('defuser', () => {
  it('neutralises a flagged charge without damage', () => {
    const board = armedBoard('defuse', 5, 0);
    const mineIdx = board.cells.findIndex((c) => c.mine > 0);
    toggleFlag(board, mineIdx);
    const res = applyDefuser(board, mineIdx);
    expect(res.hits.length).toBe(0);
    expect(board.cells[mineIdx].defused).toBe(true);
    expect(board.cells[mineIdx].mine).toBe(0);
  });

  it('safely reveals a mis-flagged safe cell', () => {
    const board = armedBoard('misflag', 5, 40);
    const safeIdx = board.cells.findIndex((c) => c.mine === 0 && !c.exit);
    toggleFlag(board, safeIdx);
    const res = applyDefuser(board, safeIdx);
    expect(board.cells[safeIdx].revealed).toBe(true);
    expect(res.hits.length).toBe(0);
  });
});

describe('drifters', () => {
  it('never move onto revealed, flagged, mine, or exit cells; invariants hold', () => {
    const board = armedBoard('drift', 7, 0);
    revealCell(board, 0);
    const before = countMines(board);
    for (let action = 1; action <= 40; action++) {
      const snapshot = cloneBoard(board);
      driftCharges(board, board.seed, 7, action);
      // Mine count preserved.
      expect(countMines(board)).toBe(before);
      // No drifter landed on an illegal cell.
      board.cells.forEach((c, i) => {
        if (c.mine === 3) {
          expect(c.revealed).toBe(false);
          expect(c.flagged).toBe(false);
          expect(c.exit).toBe(false);
        }
        // Revealed safe cells stay safe.
        if (snapshot.cells[i].revealed) expect(c.mine).toBe(0);
      });
    }
  });

  it('is deterministic for the same seed/depth/action', () => {
    const a = armedBoard('driftdet', 7, 0);
    const b = armedBoard('driftdet', 7, 0);
    revealCell(a, 0);
    revealCell(b, 0);
    driftCharges(a, a.seed, 7, 5);
    driftCharges(b, b.seed, 7, 5);
    expect(a.cells.map((c) => c.mine)).toEqual(b.cells.map((c) => c.mine));
  });

  it('reports changed readings only on revealed, charge-free cells, and clears cleanly', () => {
    const board = armedBoard('driftreport', 7, 0);
    revealCell(board, 0);
    for (let action = 1; action <= 50; action++) {
      const res = driftCharges(board, board.seed, 7, action);
      // Every reported change is a revealed, non-mine cell now flagged as drifted.
      for (const idx of res.changed) {
        const c = board.cells[idx];
        expect(c.revealed).toBe(true);
        expect(c.mine).toBe(0);
        expect(c.drifted).toBe(true);
      }
      // No move → no reported changes.
      if (!res.moved) expect(res.changed.length).toBe(0);
      clearDrifted(board);
      expect(board.cells.some((c) => c.drifted)).toBe(false);
    }
  });
});
