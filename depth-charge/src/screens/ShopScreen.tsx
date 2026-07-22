import type { Action } from '../state/actions';
import type { Meta, RunState, ItemId } from '../engine/types';
import { ITEMS, ITEM_ORDER, price, MAX_HP_CAP } from '../engine/config';

export function ShopScreen({
  run,
  meta,
  dispatch,
}: {
  run: RunState;
  meta: Meta;
  dispatch: React.Dispatch<Action>;
}) {
  const available: ItemId[] = ITEM_ORDER.filter((id) => {
    const def = ITEMS[id];
    return !def.unlock || meta.unlocks[def.unlock];
  });

  return (
    <div className="dc-shop">
      <header className="dc-shop-head">
        <p className="dc-shop-kicker mono">DEPTH {String(run.depth).padStart(2, '0')} · SUPPLY STATION</p>
        <h2 className="dc-shop-title">Restock before the descent</h2>
        <div className="dc-shop-purse">
          <span className="dc-hud-label">SALVAGE</span>
          <span className="dc-shop-purse-val mono">{run.salvage}</span>
        </div>
      </header>

      <div className="dc-shop-grid">
        {available.map((id) => {
          const def = ITEMS[id];
          const cost = price(def, run.purchases[id]);
          const owned = run.inventory[id];
          const cappedPlating = id === 'plating' && run.maxHp >= MAX_HP_CAP;
          const cappedPatch = id === 'patch' && run.hp >= run.maxHp;
          const affordable = run.salvage >= cost;
          const disabled = !affordable || cappedPlating || cappedPatch;
          return (
            <button
              key={id}
              type="button"
              className="dc-shop-item"
              disabled={disabled}
              onClick={() => dispatch({ type: 'BUY', item: id })}
            >
              <span className="dc-shop-item-glyph mono" aria-hidden>
                {def.glyph}
              </span>
              <span className="dc-shop-item-body">
                <span className="dc-shop-item-name">
                  {def.name}
                  {def.kind !== 'instant' && owned > 0 && (
                    <span className="dc-shop-owned mono"> ×{owned}</span>
                  )}
                </span>
                <span className="dc-shop-item-blurb">{def.blurb}</span>
              </span>
              <span className="dc-shop-item-price mono">
                {cappedPlating || cappedPatch ? 'MAX' : cost}
              </span>
            </button>
          );
        })}
      </div>

      <div className="dc-shop-hull" aria-label={`Hull ${run.hp} of ${run.maxHp}`}>
        <span className="dc-hud-label">HULL</span>
        <div className="dc-hull-segs">
          {Array.from({ length: run.maxHp }).map((_, i) => (
            <span key={i} className={`dc-hull-seg${i < run.hp ? ' is-full' : ''}`} />
          ))}
        </div>
      </div>

      <button
        type="button"
        className="dc-btn dc-btn--primary dc-shop-descend"
        onClick={() => dispatch({ type: 'NEXT_FLOOR' })}
      >
        <span className="dc-btn-main">DESCEND TO DEPTH {run.depth + 1}</span>
        <span className="dc-btn-sub mono">↓ {(run.depth + 1) * 120}m · the pressure builds</span>
      </button>
    </div>
  );
}
