import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Board as BoardData } from '../engine/types';
import { Cell, cellView } from './Cell';

interface BoardProps {
  board: BoardData;
  /** A primary action on a cell: dig, flag (in flag mode), or apply an armed item. */
  onPrimary: (idx: number) => void;
  /** A secondary action (always flag) — from long-press. */
  onFlag: (idx: number) => void;
  jolt: number;
  /** Deep floors: render drift-disturbed readings as "?" rather than the new number. */
  hideDrifted: boolean;
}

const LONG_PRESS_MS = 340;
const MOVE_SLOP = 10;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Board({ board, onPrimary, onFlag, jolt, hideDrifted }: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    idx: number;
    x: number;
    y: number;
    longFired: boolean;
    moved: boolean;
    timer: number | null;
  } | null>(null);

  // Retrigger the hull-jolt shake without remounting the grid.
  const firstJolt = useRef(jolt);
  useEffect(() => {
    if (jolt === firstJolt.current) return;
    const el = boardRef.current;
    if (!el || prefersReducedMotion()) return;
    el.animate(
      [
        { transform: 'translate3d(0,0,0)' },
        { transform: 'translate3d(-7px,3px,0)' },
        { transform: 'translate3d(6px,-3px,0)' },
        { transform: 'translate3d(-5px,-2px,0)' },
        { transform: 'translate3d(4px,3px,0)' },
        { transform: 'translate3d(-2px,-1px,0)' },
        { transform: 'translate3d(0,0,0)' },
      ],
      { duration: 420, easing: 'cubic-bezier(0.36,0.07,0.19,0.97)' },
    );
  }, [jolt]);

  const idxFromEvent = (e: React.PointerEvent): number => {
    const el = (e.target as HTMLElement).closest('[data-idx]') as HTMLElement | null;
    if (!el) return -1;
    return Number(el.dataset.idx);
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const idx = idxFromEvent(e);
      if (idx < 0) return;
      const timer = window.setTimeout(() => {
        if (gesture.current && !gesture.current.moved) {
          gesture.current.longFired = true;
          onFlag(gesture.current.idx);
        }
      }, LONG_PRESS_MS);
      gesture.current = {
        idx,
        x: e.clientX,
        y: e.clientY,
        longFired: false,
        moved: false,
        timer,
      };
    },
    [onFlag],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    if (Math.abs(e.clientX - g.x) > MOVE_SLOP || Math.abs(e.clientY - g.y) > MOVE_SLOP) {
      g.moved = true;
      if (g.timer != null) {
        window.clearTimeout(g.timer);
        g.timer = null;
      }
    }
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const g = gesture.current;
      gesture.current = null;
      if (!g) return;
      if (g.timer != null) window.clearTimeout(g.timer);
      if (g.longFired || g.moved) return;
      const idx = idxFromEvent(e);
      if (idx === g.idx && idx >= 0) onPrimary(idx);
    },
    [onPrimary],
  );

  const onPointerCancel = useCallback(() => {
    if (gesture.current?.timer != null) window.clearTimeout(gesture.current.timer);
    gesture.current = null;
  }, []);

  const cells = useMemo(
    () =>
      board.cells.map((c, i) => (
        <Cell
          key={i}
          idx={i}
          view={cellView(c, hideDrifted)}
          adj={c.adj}
          drifted={c.revealed && c.drifted}
        />
      )),
    [board.cells, hideDrifted],
  );

  return (
    <div className="dc-board-scroll">
      <div
        ref={boardRef}
        className="dc-board"
        style={{ '--cols': board.cols, '--rows': board.rows } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        role="grid"
        aria-label="Sonar console"
      >
        {cells}
      </div>
    </div>
  );
}
