import { useCallback } from 'react';
import type { Action } from '../state/actions';
import type { RunState } from '../engine/types';
import { Board } from '../components/Board';
import { Hud } from '../components/Hud';
import { ItemBar } from '../components/ItemBar';
import { Toast } from '../components/Toast';

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
      <Board board={run.board} onPrimary={onPrimary} onFlag={onFlag} jolt={run.jolt} />
      {run.alarm > 0 && <div className="dc-alarm-flash" key={`alarm-${run.alarm}`} aria-hidden />}
      <ItemBar run={run} dispatch={dispatch} />
      {run.toast && (
        <Toast toast={run.toast} onDismiss={(id) => dispatch({ type: 'DISMISS_TOAST', id })} />
      )}
    </div>
  );
}
