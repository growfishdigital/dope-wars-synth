import type { Action } from '../state/actions';
import type { RunState, ItemId } from '../engine/types';
import { ITEMS, ITEM_ORDER } from '../engine/config';

const INSTANT: ItemId[] = ['patch', 'plating', 'transponder'];

export function ItemBar({
  run,
  dispatch,
}: {
  run: RunState;
  dispatch: React.Dispatch<Action>;
}) {
  const owned = ITEM_ORDER.filter((id) => run.inventory[id] > 0);
  const armedReady = run.board.armed;

  return (
    <nav className="dc-itembar" aria-label="Controls">
      <button
        type="button"
        className={`dc-mode ${run.flagMode ? 'is-flag' : 'is-dig'}`}
        onClick={() => dispatch({ type: 'SET_FLAG_MODE', on: !run.flagMode })}
        aria-pressed={run.flagMode}
        aria-label={run.flagMode ? 'Flag mode — tap to switch to dig' : 'Dig mode — tap to switch to flag'}
      >
        <span className="dc-mode-glyph" aria-hidden>
          {run.flagMode ? '⚑' : '◎'}
        </span>
        <span className="dc-mode-text">{run.flagMode ? 'FLAG' : 'DIG'}</span>
      </button>

      <div className="dc-items" role="group" aria-label="Equipment">
        {owned.length === 0 && (
          <span className="dc-items-empty mono">no equipment — buy at the supply station</span>
        )}
        {owned.map((id) => {
          const def = ITEMS[id];
          const passive = def.kind === 'passive';
          const armed = run.armedItem === id;
          const disabled = !armedReady && !passive;
          return (
            <button
              key={id}
              type="button"
              className={`dc-item${armed ? ' is-armed' : ''}${passive ? ' is-passive' : ''}`}
              disabled={disabled}
              aria-pressed={armed}
              title={`${def.name} — ${def.blurb}`}
              onClick={() => {
                if (passive) return;
                if (INSTANT.includes(id)) dispatch({ type: 'USE_ITEM', item: id });
                else dispatch({ type: 'ARM_ITEM', item: id });
              }}
            >
              <span className="dc-item-glyph mono" aria-hidden>
                {def.glyph}
              </span>
              <span className="dc-item-count mono">{run.inventory[id]}</span>
              <span className="dc-item-name">{def.name}</span>
            </button>
          );
        })}
      </div>

      {run.exitFound ? (
        <button
          type="button"
          className="dc-descend"
          onClick={() => dispatch({ type: 'DESCEND' })}
        >
          <span className="dc-descend-text">DESCEND</span>
          <span className="dc-descend-sub mono" aria-hidden>
            ↓ next floor
          </span>
        </button>
      ) : (
        <div className="dc-descend dc-descend--locked" aria-hidden>
          <span className="dc-descend-text">EXIT</span>
          <span className="dc-descend-sub mono">find the hatch</span>
        </div>
      )}

      {run.armedItem && (
        <button
          type="button"
          className="dc-arm-cancel"
          onClick={() => dispatch({ type: 'CANCEL_ARM' })}
        >
          tap a cell to use {ITEMS[run.armedItem].name} · cancel
        </button>
      )}
    </nav>
  );
}
