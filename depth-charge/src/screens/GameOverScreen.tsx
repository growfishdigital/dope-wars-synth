import type { Action } from '../state/actions';
import type { Meta, RunState, UnlockId } from '../engine/types';
import { ITEMS, METRES_PER_FLOOR } from '../engine/config';
import { dailySeed, randomSeed } from '../engine/rng';
import { todayUTC } from '../state/persist';

const UNLOCK_NAMES: Record<UnlockId, string> = {
  defuser: ITEMS.defuser.name,
  transponder: ITEMS.transponder.name,
  ballast: ITEMS.ballast.name,
};

export function GameOverScreen({
  run,
  meta,
  dispatch,
}: {
  run: RunState;
  meta: Meta;
  dispatch: React.Dispatch<Action>;
}) {
  const over = run.over!;
  const isRecord = over.depth >= meta.bestDepth && over.depth > 0;
  const today = todayUTC();

  const retry = () => {
    if (run.mode === 'daily') {
      dispatch({ type: 'START_RUN', mode: 'daily', seed: dailySeed(today) });
    } else {
      const seed = randomSeed(performance.now() * 1000 + Math.random() * 1e9);
      dispatch({ type: 'START_RUN', mode: 'free', seed });
    }
  };

  return (
    <div className="dc-over">
      <p className="dc-over-cause mono">{over.cause.toUpperCase()}</p>
      <h2 className="dc-over-title">The dark takes the pod</h2>

      <div className="dc-over-depth">
        <span className="dc-over-depth-num mono">{over.depth}</span>
        <span className="dc-over-depth-label">
          floors deep
          <span className="dc-over-depth-metres mono">{over.depth * METRES_PER_FLOOR}m</span>
        </span>
      </div>
      {isRecord && <p className="dc-over-record">◆ NEW PERSONAL BEST ◆</p>}

      <dl className="dc-over-stats">
        <div>
          <dt>SALVAGE</dt>
          <dd className="mono">{over.salvage}</dd>
        </div>
        <div>
          <dt>BEST STREAK</dt>
          <dd className="mono">×{run.bestStreak}</dd>
        </div>
        <div>
          <dt>MODE</dt>
          <dd className="mono">{run.mode === 'daily' ? 'DAILY' : 'FREE'}</dd>
        </div>
      </dl>

      {run.newUnlocks.length > 0 && (
        <div className="dc-over-unlocks">
          <p className="dc-over-unlocks-head mono">EQUIPMENT UNLOCKED</p>
          <ul>
            {run.newUnlocks.map((u) => (
              <li key={u}>
                <span className="dc-item-glyph mono" aria-hidden>
                  {ITEMS[u].glyph}
                </span>
                {UNLOCK_NAMES[u]} — now stocked at the supply station
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="dc-over-actions">
        <button type="button" className="dc-btn dc-btn--primary" onClick={retry}>
          <span className="dc-btn-main">DIVE AGAIN</span>
        </button>
        <button
          type="button"
          className="dc-btn dc-btn--ghost"
          onClick={() => dispatch({ type: 'GO_TITLE' })}
        >
          <span className="dc-btn-main">SURFACE</span>
        </button>
      </div>
    </div>
  );
}
