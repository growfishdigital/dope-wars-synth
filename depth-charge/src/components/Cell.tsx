import { memo } from 'react';
import type { Cell as CellData } from '../engine/types';

export type CellView =
  | 'hidden'
  | 'hidden-safe' // scanned, known safe
  | 'hidden-charge' // scanned, charge detected
  | 'beacon'
  | 'flag'
  | 'empty'
  | 'number'
  | 'exit'
  | 'detonated'
  | 'defused';

export function cellView(c: CellData): CellView {
  if (c.revealed) {
    if (c.detonated) return 'detonated';
    if (c.defused) return 'defused';
    if (c.exit) return 'exit';
    return c.adj > 0 ? 'number' : 'empty';
  }
  if (c.flagged) return 'flag';
  if (c.beacon) return 'beacon';
  if (c.scanned) return c.mine > 0 ? 'hidden-charge' : 'hidden-safe';
  return 'hidden';
}

interface CellProps {
  idx: number;
  view: CellView;
  adj: number;
}

function CellImpl({ idx, view, adj }: CellProps) {
  let content: React.ReactNode = null;
  if (view === 'number') content = <span className="mono">{adj}</span>;
  else if (view === 'flag') content = <span className="dc-flag-mark" aria-hidden />;
  else if (view === 'exit') content = <span className="dc-exit-mark" aria-hidden>◈</span>;
  else if (view === 'detonated') content = <span className="dc-boom-mark" aria-hidden>✳</span>;
  else if (view === 'defused') content = <span className="dc-defused-mark" aria-hidden>⌀</span>;
  else if (view === 'beacon') content = <span className="dc-beacon-mark" aria-hidden>◎</span>;
  else if (view === 'hidden-charge') content = <span className="dc-scan-dot dc-scan-charge" aria-hidden />;
  else if (view === 'hidden-safe') content = <span className="dc-scan-dot dc-scan-safe" aria-hidden />;

  return (
    <div
      className={`dc-cell dc-cell--${view}`}
      data-idx={idx}
      data-n={view === 'number' ? adj : undefined}
      role="gridcell"
      aria-label={ariaLabel(view, adj)}
    >
      {content}
    </div>
  );
}

function ariaLabel(view: CellView, adj: number): string {
  switch (view) {
    case 'hidden':
    case 'hidden-safe':
    case 'hidden-charge':
    case 'beacon':
      return 'hidden cell';
    case 'flag':
      return 'flagged';
    case 'empty':
      return 'clear';
    case 'number':
      return `${adj} nearby`;
    case 'exit':
      return 'exit hatch';
    case 'detonated':
      return 'detonated charge';
    case 'defused':
      return 'defused charge';
  }
}

export const Cell = memo(CellImpl);
