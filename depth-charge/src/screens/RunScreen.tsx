import { useCallback } from 'react';
import type { Action } from '../state/actions';
import type { RunState } from '../engine/types';
import { Board } from '../components/Board';
import { Hud } from '../components/Hud';
import { ItemBar } from '../components/ItemBar';
import { Toast } from '../components/Toast';
import { Briefing } from '../components/Briefing';
import { DRIFT_UNKNOWN_DEPTH } from '../engine/config';

export function RunScreen({
  run,
  dispatch,
}: {
  run: RunState;
  dispatch: React.Dispatch<Action>;
}) {
  const onPrimary = useCallback(
    (idx: number) => {
      if (run.armedItem) {
        dispatch({ type: 'TARGET', idx });
        return;
      }
      const cell = run.board.cells[idx];
      if (run.flagMode && !cell.revealed) {
        dispatch({ type: 'FLAG', idx });
        return;
      }
      dispatch({ type: 'REVEAL', idx });
    },
    [run.armedItem, run.flagMode, run.board, dispatch],
  );

  const onFlag = useCallback(
    (idx: number) => {
      if (run.armedItem) return;
      dispatch({ type: 'FLAG', idx });
    },
    [run.armedItem, dispatch],
  );

  return (
    <div className={`dc-run${run.armedItem ? ' is-targeting' : ''}`}>
      <Hud run={run} />
      <div className="dc-scope">
        <Graticule />
        <Board
          board={run.board}
          onPrimary={onPrimary}
          onFlag={onFlag}
          jolt={run.jolt}
          hideDrifted={run.depth >= DRIFT_UNKNOWN_DEPTH}
        />
      </div>
      {run.alarm > 0 && <div className="dc-alarm-flash" key={`alarm-${run.alarm}`} aria-hidden />}
      <ItemBar run={run} dispatch={dispatch} />
      {run.toast && (
        <Toast toast={run.toast} onDismiss={(id) => dispatch({ type: 'DISMISS_TOAST', id })} />
      )}
      {run.briefing && <Briefing id={run.briefing} dispatch={dispatch} />}
    </div>
  );
}

/** The sonar scope's range graticule — concentric rings and a crosshair that
 *  fill the housing behind and around the grid. A slow sweep line passes over. */
function Graticule() {
  return (
    <svg className="dc-graticule" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="dc-grat-fade" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="var(--phosphor)" stopOpacity="0.16" />
          <stop offset="70%" stopColor="var(--phosphor)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="var(--phosphor)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g stroke="url(#dc-grat-fade)" fill="none" strokeWidth="0.5">
        <circle cx="100" cy="84" r="30" />
        <circle cx="100" cy="84" r="58" />
        <circle cx="100" cy="84" r="86" />
        <circle cx="100" cy="84" r="114" />
        <line x1="100" y1="-40" x2="100" y2="208" />
        <line x1="-40" y1="84" x2="240" y2="84" />
      </g>
    </svg>
  );
}
