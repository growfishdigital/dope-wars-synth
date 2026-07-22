import type { RunState } from '../engine/types';
import { floorConfig } from '../engine/config';
import { streakMultiplier } from '../engine/economy';
import { AnimatedNumber } from './AnimatedNumber';

function HullBar({ hp, maxHp }: { hp: number; maxHp: number }) {
  const tone = hp <= 1 ? 'crit' : hp <= 2 ? 'low' : 'ok';
  return (
    <div className="dc-hull" aria-label={`Hull integrity ${hp} of ${maxHp}`}>
      <span className="dc-hud-label">HULL</span>
      <div className={`dc-hull-segs dc-hull-segs--${tone}`}>
        {Array.from({ length: maxHp }).map((_, i) => (
          <span key={i} className={`dc-hull-seg${i < hp ? ' is-full' : ''}`} />
        ))}
      </div>
    </div>
  );
}

export function Hud({ run }: { run: RunState }) {
  const cfg = floorConfig(run.depth);
  const chargesLeft = Math.max(0, run.board.minesLeft - run.board.flags);
  const mult = streakMultiplier(run.streak);

  return (
    <header className="dc-hud">
      <div className="dc-hud-depth">
        <span className="dc-hud-label">DEPTH</span>
        <span className="dc-hud-depth-val mono">{String(run.depth).padStart(2, '0')}</span>
        <span className="dc-hud-metres mono">{cfg.metres}m</span>
      </div>

      <HullBar hp={run.hp} maxHp={run.maxHp} />

      <div className="dc-hud-stats">
        <div className="dc-hud-stat" aria-label="Salvage">
          <span className="dc-hud-label">SALVAGE</span>
          <span className="dc-hud-salvage mono">
            <AnimatedNumber value={run.salvage} />
          </span>
        </div>
        <div className="dc-hud-stat" aria-label="Charges remaining">
          <span className="dc-hud-label">CHARGES</span>
          <span className="dc-hud-charges mono">{chargesLeft}</span>
        </div>
      </div>

      {mult > 1 && (
        <div className="dc-streak" aria-label={`Streak multiplier ${mult} times`}>
          <span className="mono">×{mult % 1 === 0 ? mult : mult.toFixed(1)}</span>
        </div>
      )}
    </header>
  );
}
