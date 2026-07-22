/*
 * Depth Charge audio — hand-rolled WebAudio. A submarine's acoustic world:
 * sonar pings with echo tails, bubbling reveals, metallic flag clicks, muffled
 * charge detonations, hull alarms, and a low abyssal drone underneath it all.
 * No samples, no dependencies.
 */

class SonarAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private echo: DelayNode | null = null;
  private muted = false;
  private ambientOn = false;
  private ambientNodes: Array<OscillatorNode | GainNode> = [];
  private ambientTimers: number[] = [];

  setInitialMute(m: boolean) {
    this.muted = m;
  }

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.7;
    master.connect(ctx.destination);

    // Shared echo bus for the "deep water" tails.
    const echo = ctx.createDelay(1.0);
    echo.delayTime.value = 0.26;
    const fb = ctx.createGain();
    fb.gain.value = 0.34;
    const echoLevel = ctx.createGain();
    echoLevel.gain.value = 0.5;
    echo.connect(fb);
    fb.connect(echo);
    echo.connect(echoLevel);
    echoLevel.connect(master);

    this.ctx = ctx;
    this.master = master;
    this.echo = echo;
    return ctx;
  }

  /** Resume the context after a user gesture (autoplay policy). */
  resume() {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') void ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.linearRampToValueAtTime(m ? 0 : 0.7, this.ctx.currentTime + 0.08);
    }
  }

  isMuted() {
    return this.muted;
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    opts: { toEcho?: boolean; slideTo?: number; delay?: number } = {},
  ) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    if (opts.toEcho && this.echo) g.connect(this.echo);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(dur: number, gain: number, filterFrom: number, filterTo: number) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime;
    const frames = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFrom, t0);
    filter.frequency.exponentialRampToValueAtTime(filterTo, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t0);
    src.stop(t0 + dur);
  }

  // ---- UI voices --------------------------------------------------

  tap() {
    this.tone(660, 0.05, 'square', 0.04);
  }

  /** A single reveal — a soft rising bubble. Pitch climbs with the combo streak. */
  reveal(streak = 0) {
    const base = 320 + Math.min(streak, 10) * 26;
    this.tone(base, 0.12, 'sine', 0.08, { slideTo: base * 1.8 });
  }

  /** A flood of reveals — a quick cluster of bubbles. */
  flood(count: number, streak = 0) {
    const n = Math.min(count, 6);
    for (let i = 0; i < n; i++) {
      const base = 300 + Math.random() * 260 + Math.min(streak, 10) * 18;
      this.tone(base, 0.1, 'sine', 0.05, { slideTo: base * 1.7, delay: i * 0.035 });
    }
  }

  ping() {
    this.tone(1180, 0.42, 'sine', 0.12, { toEcho: true, slideTo: 760 });
  }

  flag() {
    this.tone(230, 0.05, 'square', 0.09);
    this.tone(180, 0.08, 'triangle', 0.05, { delay: 0.02 });
  }

  unflag() {
    this.tone(160, 0.06, 'square', 0.06);
  }

  /** A charge going off — muffled underwater thud plus a low pressure drop. */
  boom(big = false) {
    this.noise(big ? 0.6 : 0.4, big ? 0.5 : 0.34, big ? 1100 : 800, 50);
    this.tone(big ? 110 : 90, big ? 0.55 : 0.4, 'sine', big ? 0.3 : 0.22, {
      slideTo: 28,
      toEcho: true,
    });
  }

  alarm() {
    this.tone(880, 0.16, 'sawtooth', 0.09);
    this.tone(740, 0.2, 'sawtooth', 0.09, { delay: 0.14 });
  }

  hatch() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this.tone(f, 0.24, 'triangle', 0.1, { delay: i * 0.08, toEcho: true }),
    );
  }

  coin() {
    this.tone(1046, 0.09, 'triangle', 0.08);
    this.tone(1568, 0.12, 'triangle', 0.08, { delay: 0.05 });
  }

  buy() {
    this.tone(392, 0.08, 'triangle', 0.09);
    this.tone(587, 0.1, 'triangle', 0.09, { delay: 0.06 });
  }

  descend() {
    this.tone(420, 1.1, 'sawtooth', 0.14, { slideTo: 48, toEcho: true });
    this.noise(1.0, 0.12, 600, 60);
  }

  gameover() {
    [330, 262, 196, 131].forEach((f, i) =>
      this.tone(f, 0.5, 'sawtooth', 0.13, { delay: i * 0.22, toEcho: true }),
    );
  }

  // ---- Ambient drone ---------------------------------------------

  startAmbient() {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.ambientOn) return;
    this.ambientOn = true;

    const bed = ctx.createGain();
    bed.gain.setValueAtTime(0.0001, ctx.currentTime);
    bed.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 3);
    bed.connect(this.master);

    // Two very low detuned sines — the pressure of deep water.
    const a = ctx.createOscillator();
    const b = ctx.createOscillator();
    a.type = 'sine';
    b.type = 'sine';
    a.frequency.value = 54;
    b.frequency.value = 54;
    b.detune.value = 8;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 220;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 90;
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);
    a.connect(lp);
    b.connect(lp);
    lp.connect(bed);
    a.start();
    b.start();
    lfo.start();

    // Occasional distant ping, far off in the dark.
    const distant = window.setInterval(() => {
      if (!this.ambientOn) return;
      if (Math.random() < 0.5) this.tone(900, 0.5, 'sine', 0.03, { toEcho: true, slideTo: 640 });
    }, 9000);

    this.ambientNodes = [a, b, lfo, lfoGain, lp, bed];
    this.ambientTimers = [distant];
  }

  stopAmbient() {
    if (!this.ambientOn || !this.ctx) return;
    this.ambientOn = false;
    this.ambientTimers.forEach((t) => clearInterval(t));
    this.ambientTimers = [];
    const bed = this.ambientNodes.find((n): n is GainNode => n instanceof GainNode && n.numberOfInputs > 0);
    const now = this.ctx.currentTime;
    try {
      if (bed) bed.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      const nodes = this.ambientNodes;
      window.setTimeout(() => {
        nodes.forEach((n) => {
          if (n instanceof OscillatorNode) {
            try {
              n.stop();
            } catch {
              /* already stopped */
            }
          }
        });
      }, 900);
    } catch {
      /* ignore */
    }
    this.ambientNodes = [];
  }
}

export const Audio = new SonarAudio();
