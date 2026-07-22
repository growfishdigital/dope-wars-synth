import { Component, useEffect, useRef, type ReactNode } from 'react';
import { StoreProvider, useStore } from './state/StoreContext';
import { TitleScreen } from './screens/TitleScreen';
import { RunScreen } from './screens/RunScreen';
import { ShopScreen } from './screens/ShopScreen';
import { GameOverScreen } from './screens/GameOverScreen';
import { Audio } from './audio/sonar';
import { floorConfig, METRES_PER_FLOOR } from './engine/config';
import type { SfxCue } from './engine/types';
import './styles/global.css';
import './styles/app.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="dc-fatal">
          <h1>The console has flooded</h1>
          <pre>{this.state.error.message}</pre>
          <button type="button" onClick={() => location.reload()}>
            reboot
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function playCue(cue: SfxCue) {
  switch (cue.kind) {
    case 'reveal':
      Audio.reveal(cue.streak);
      break;
    case 'flood':
      Audio.flood(cue.n ?? 3, cue.streak);
      break;
    case 'boom':
      Audio.boom(false);
      Audio.alarm();
      break;
    case 'boomBig':
      Audio.boom(true);
      Audio.alarm();
      break;
    case 'hatch':
      Audio.hatch();
      break;
    case 'clear':
      Audio.hatch();
      Audio.coin();
      break;
    case 'descend':
      Audio.descend();
      break;
    case 'flag':
      Audio.flag();
      break;
    case 'unflag':
      Audio.unflag();
      break;
    case 'sonar':
      Audio.ping();
      break;
    case 'defuse':
      Audio.ping();
      break;
    case 'buy':
      Audio.buy();
      break;
    case 'ballast':
      Audio.buy();
      break;
    case 'error':
      Audio.unflag();
      break;
  }
}

function Game() {
  const { state, dispatch } = useStore();
  const { run, meta, muted } = state;

  // Keep the audio engine's mute in sync.
  useEffect(() => {
    Audio.setMuted(muted);
  }, [muted]);

  // Play the reducer's most-recent sound cue exactly once.
  const lastCue = useRef<number>(0);
  useEffect(() => {
    if (run.sfx && run.sfx.id !== lastCue.current) {
      lastCue.current = run.sfx.id;
      playCue(run.sfx);
    }
  }, [run.sfx]);

  // Ambient drone plays only while actively diving.
  useEffect(() => {
    if (run.screen === 'run') Audio.startAmbient();
    else Audio.stopAmbient();
  }, [run.screen]);

  // Game-over sting.
  const wasOver = useRef(false);
  useEffect(() => {
    if (run.screen === 'gameover' && !wasOver.current) {
      wasOver.current = true;
      Audio.gameover();
    }
    if (run.screen !== 'gameover') wasOver.current = false;
  }, [run.screen]);

  // Depth-reactive atmosphere: hue shifts and the vignette tightens with depth.
  useEffect(() => {
    const cfg = floorConfig(run.depth || 1);
    const tint = 232 - Math.min(run.depth * 4, 40);
    const fog = Math.min((cfg.metres / METRES_PER_FLOOR) * 0.02, 0.3);
    document.documentElement.style.setProperty('--depth-tint', String(tint));
    document.documentElement.style.setProperty('--depth-fog', String(fog));
  }, [run.depth]);

  // First user gesture resumes the audio context (autoplay policy).
  const onFirstPointer = () => Audio.resume();

  return (
    <div className="dc-app" onPointerDown={onFirstPointer}>
      <div className="dc-shell">
        {run.screen === 'title' && (
          <TitleScreen meta={meta} muted={muted} dispatch={dispatch} />
        )}
        {run.screen === 'run' && <RunScreen run={run} dispatch={dispatch} />}
        {run.screen === 'shop' && <ShopScreen run={run} meta={meta} dispatch={dispatch} />}
        {run.screen === 'gameover' && (
          <GameOverScreen run={run} meta={meta} dispatch={dispatch} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <Game />
      </StoreProvider>
    </ErrorBoundary>
  );
}
