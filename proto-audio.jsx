// ═══════════════════════════════════════════════════════════
// proto-audio.jsx — WebAudio: synthwave ambient + UI sfx
// ═══════════════════════════════════════════════════════════

const DWAudio = (() => {
  let ctx = null;
  let masterGain = null;
  let ambientOn = false;
  let ambientNodes = [];
  let muted = localStorage.getItem('dw-muted') === '1';

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 0.6;
    masterGain.connect(ctx.destination);
    return ctx;
  }

  // ── UI sounds ────────────────────────────────────────────
  function tone(freq, dur = 0.12, type = 'sine', gain = 0.15, detune = 0) {
    const c = ensure();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    osc.connect(g); g.connect(masterGain);
    osc.start();
    osc.stop(c.currentTime + dur + 0.05);
  }

  function tap() {
    tone(880, 0.05, 'square', 0.06);
  }
  function confirm() {
    tone(523, 0.08, 'triangle', 0.1);
    setTimeout(() => tone(784, 0.1, 'triangle', 0.1), 60);
  }
  function cancel() {
    tone(400, 0.08, 'square', 0.08);
    setTimeout(() => tone(280, 0.12, 'square', 0.08), 50);
  }
  function cashRegister() {
    const c = ensure();
    if (!c) return;
    // Ching!
    [880, 1320, 1760].forEach((f, i) => {
      setTimeout(() => tone(f, 0.15, 'triangle', 0.12), i * 40);
    });
  }
  function buzz() {
    // Phone notification
    tone(1200, 0.06, 'square', 0.1);
    setTimeout(() => tone(900, 0.08, 'square', 0.1), 80);
  }
  function bigWin() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((f, i) => setTimeout(() => tone(f, 0.2, 'triangle', 0.15), i * 90));
  }
  function lose() {
    const c = ensure();
    if (!c) return;
    [440, 330, 220, 165].forEach((f, i) => {
      setTimeout(() => tone(f, 0.3, 'sawtooth', 0.12), i * 120);
    });
  }
  function whoosh() {
    const c = ensure();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.4);
    g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(0.08, c.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.4);
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 3;
    osc.connect(filter); filter.connect(g); g.connect(masterGain);
    osc.start();
    osc.stop(c.currentTime + 0.5);
  }

  // ── Synthwave ambient loop ───────────────────────────────
  // Slow pad + bass + arp. Plays in a loop.
  function startAmbient() {
    const c = ensure();
    if (!c || ambientOn) return;
    ambientOn = true;

    const ambientGain = c.createGain();
    ambientGain.gain.value = 0;
    ambientGain.gain.linearRampToValueAtTime(0.35, c.currentTime + 2);
    ambientGain.connect(masterGain);

    // Pad — two detuned saws with lowpass sweep
    const padA = c.createOscillator();
    const padB = c.createOscillator();
    padA.type = 'sawtooth'; padB.type = 'sawtooth';
    padA.frequency.value = 110; // A
    padB.frequency.value = 110; padB.detune.value = 12;
    const padFilter = c.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 400;
    padFilter.Q.value = 6;
    const padGain = c.createGain();
    padGain.gain.value = 0.07;

    // LFO to sweep pad filter
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 600;
    lfo.connect(lfoGain); lfoGain.connect(padFilter.frequency);

    padA.connect(padFilter); padB.connect(padFilter);
    padFilter.connect(padGain); padGain.connect(ambientGain);

    // Bass — pulse on 1 and 3
    const bassNotes = [55, 55, 73, 65]; // A, A, D, E
    let bassIdx = 0;
    function pulseBass() {
      if (!ambientOn) return;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'triangle';
      osc.frequency.value = bassNotes[bassIdx % bassNotes.length];
      bassIdx++;
      g.gain.value = 0;
      const now = c.currentTime;
      g.gain.linearRampToValueAtTime(0.12, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
      osc.connect(g); g.connect(ambientGain);
      osc.start(now);
      osc.stop(now + 1.4);
    }

    // Arp — minor pentatonic
    const arpFreqs = [440, 523, 659, 784, 880, 784, 659, 523]; // A C E G A G E C
    let arpIdx = 0;
    function pulseArp() {
      if (!ambientOn) return;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'square';
      osc.frequency.value = arpFreqs[arpIdx % arpFreqs.length];
      arpIdx++;
      const now = c.currentTime;
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.04, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1800;
      osc.connect(filter); filter.connect(g); g.connect(ambientGain);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    padA.start(); padB.start(); lfo.start();

    const bassInterval = setInterval(pulseBass, 1400);
    const arpInterval = setInterval(pulseArp, 350);

    ambientNodes = [padA, padB, lfo, ambientGain, bassInterval, arpInterval];
  }

  function stopAmbient() {
    if (!ambientOn) return;
    ambientOn = false;
    const [padA, padB, lfo, g, bi, ai] = ambientNodes;
    clearInterval(bi); clearInterval(ai);
    const c = ctx;
    try {
      g.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
      setTimeout(() => {
        try { padA.stop(); padB.stop(); lfo.stop(); } catch (e) {}
      }, 600);
    } catch (e) {}
    ambientNodes = [];
  }

  function setMuted(m) {
    muted = m;
    localStorage.setItem('dw-muted', m ? '1' : '0');
    if (masterGain) {
      masterGain.gain.linearRampToValueAtTime(m ? 0 : 0.6, ctx.currentTime + 0.1);
    }
  }
  function isMuted() { return muted; }
  function isAmbientOn() { return ambientOn; }

  return { ensure, tap, confirm, cancel, cashRegister, buzz, bigWin, lose, whoosh, startAmbient, stopAmbient, setMuted, isMuted, isAmbientOn };
})();

Object.assign(window, { DWAudio });
