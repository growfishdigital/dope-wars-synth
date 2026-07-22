import { useState } from 'react';
import type { Action } from '../state/actions';
import type { Meta } from '../engine/types';
import { dailySeed, randomSeed } from '../engine/rng';
import { todayUTC } from '../state/persist';
import { METRES_PER_FLOOR } from '../engine/config';

export function TitleScreen({
  meta,
  muted,
  dispatch,
}: {
  meta: Meta;
  muted: boolean;
  dispatch: React.Dispatch<Action>;
}) {
  const [showHow, setShowHow] = useState(false);
  const today = todayUTC();
  const dailyDone = meta.daily.lastDate === today;
  const dailyBest = meta.daily.bestDepthByDate[today] ?? 0;

  const startFree = () => {
    const seed = randomSeed(performance.now() * 1000 + Math.random() * 1e9);
    dispatch({ type: 'START_RUN', mode: 'free', seed });
  };
  const startDaily = () => {
    dispatch({ type: 'START_RUN', mode: 'daily', seed: dailySeed(today) });
  };

  return (
    <div className="dc-title">
      <button
        type="button"
        className="dc-mute"
        onClick={() => dispatch({ type: 'SET_MUTED', muted: !muted })}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      <div className="dc-title-mark" aria-hidden>
        <div className="dc-sonar-emblem">
          <span className="dc-sonar-sweep" />
          <span className="dc-sonar-ring" />
          <span className="dc-sonar-ring dc-sonar-ring--2" />
          <span className="dc-sonar-blip dc-sonar-blip--a" />
          <span className="dc-sonar-blip dc-sonar-blip--b" />
        </div>
      </div>

      <h1 className="dc-title-name">
        DEPTH<span className="dc-title-name-sub">CHARGE</span>
      </h1>
      <p className="dc-title-tag">
        Descend the trench floor by floor. Ping the dark, flag the charges, find the
        hatch. The deeper you salvage, the less forgiving the pressure.
      </p>

      <div className="dc-title-actions">
        <button type="button" className="dc-btn dc-btn--primary" onClick={startFree}>
          <span className="dc-btn-main">FREE DIVE</span>
          <span className="dc-btn-sub mono">fresh trench, new seed</span>
        </button>
        <button
          type="button"
          className="dc-btn dc-btn--ghost"
          onClick={startDaily}
        >
          <span className="dc-btn-main">DAILY DIVE {dailyDone && <span className="dc-daily-done">✓</span>}</span>
          <span className="dc-btn-sub mono">
            {dailyDone ? `today's best · depth ${dailyBest}` : "everyone's trench today"}
          </span>
        </button>
      </div>

      <dl className="dc-title-stats">
        <div>
          <dt>BEST DEPTH</dt>
          <dd className="mono">
            {meta.bestDepth}
            {meta.bestDepth > 0 && (
              <span className="dc-stat-unit"> · {meta.bestDepth * METRES_PER_FLOOR}m</span>
            )}
          </dd>
        </div>
        <div>
          <dt>BEST SALVAGE</dt>
          <dd className="mono">{meta.bestSalvage}</dd>
        </div>
        <div>
          <dt>DIVES</dt>
          <dd className="mono">{meta.totalDives}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="dc-how-toggle"
        onClick={() => setShowHow((v) => !v)}
        aria-expanded={showHow}
      >
        {showHow ? '– how to dive' : '+ how to dive'}
      </button>
      {showHow && (
        <div className="dc-how">
          <p>
            <b>Tap</b> a cell to ping it. Numbers count the charges in the eight
            surrounding cells. <b>Long-press</b> (or flip to FLAG mode) to mark a suspected
            charge.
          </p>
          <p>
            <b>Tap a revealed number</b> whose flags match its count to sweep the rest
            around it at once.
          </p>
          <p>
            A hit costs <b>hull integrity</b>. Run out and the dark takes you. Reveal the
            hidden <b>exit hatch</b> to unlock the descent — then choose to drop, or press
            your luck for more salvage.
          </p>
          <p>
            Spend salvage at the <b>supply station</b> between floors. Deeper trenches hide
            volatile charges and drifting contacts that will not sit still.
          </p>
        </div>
      )}
    </div>
  );
}
