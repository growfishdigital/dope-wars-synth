// ═══════════════════════════════════════════════════════════
// proto-ui.jsx — HUD, buttons, sheets, number animators
// ═══════════════════════════════════════════════════════════

// Neon CTA button
function NeonBtn({ children, color = DW.magenta, onClick, disabled, style = {}, small, ghost }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onPointerDown={() => { setPressed(true); DWAudio.tap(); }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={onClick}
      disabled={disabled}
      style={{
        appearance: 'none', border: `1.5px solid ${color}`,
        background: ghost ? 'transparent' : pressed ? color : `${color}22`,
        color: ghost ? color : pressed ? '#14052a' : '#fff',
        padding: small ? '8px 14px' : '14px 22px',
        fontFamily: DW.display, fontWeight: 800, letterSpacing: '0.08em',
        fontSize: small ? 12 : 14, textTransform: 'uppercase', cursor: 'pointer',
        borderRadius: 2, transition: 'all 120ms',
        boxShadow: pressed ? `0 0 28px ${color}aa` : `0 0 12px ${color}66`,
        opacity: disabled ? 0.35 : 1,
        transform: pressed ? 'translateY(1px)' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// Stepper control (+/-) with quick actions
function Stepper({ value, onChange, min = 0, max = 99, step = 1, color = DW.magenta }) {
  const inc = () => { DWAudio.tap(); onChange(Math.min(max, value + step)); };
  const dec = () => { DWAudio.tap(); onChange(Math.max(min, value - step)); };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <button onClick={dec} disabled={value <= min}
        style={stepBtnStyle(color, value <= min)}>−</button>
      <div style={{
        fontFamily: DW.display, fontSize: 32, color: '#fff',
        minWidth: 70, textAlign: 'center',
        textShadow: `0 0 20px ${color}`,
      }}>{value}</div>
      <button onClick={inc} disabled={value >= max}
        style={stepBtnStyle(color, value >= max)}>+</button>
    </div>
  );
}
function stepBtnStyle(color, disabled) {
  return {
    width: 44, height: 44, borderRadius: '50%',
    border: `1.5px solid ${color}`, background: `${color}22`,
    color: '#fff', fontSize: 24, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 0 12px ${color}55`, opacity: disabled ? 0.3 : 1,
  };
}

// Slider — big, tactile
function BigSlider({ value, onChange, min = 0, max = 100, color = DW.magenta }) {
  const trackRef = React.useRef(null);
  const pct = max > min ? (value - min) / (max - min) * 100 : 0;
  const handleDrag = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const v = Math.round(min + p * (max - min));
    onChange(v);
  };
  return (
    <div
      ref={trackRef}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        DWAudio.tap();
        handleDrag(e.clientX);
      }}
      onPointerMove={(e) => { if (e.buttons) handleDrag(e.clientX); }}
      style={{
        position: 'relative', height: 48, borderRadius: 24,
        background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${pct}%`,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        borderRadius: 24, boxShadow: `0 0 20px ${color}99`,
      }}/>
      <div style={{
        position: 'absolute', left: `calc(${pct}% - 18px)`, top: 6,
        width: 36, height: 36, borderRadius: '50%',
        background: '#fff', boxShadow: `0 0 14px ${color}, 0 0 30px ${color}66`,
        border: `2px solid ${color}`,
      }}/>
    </div>
  );
}

// Animated number (cash counter)
function AnimatedNum({ value, format = fmt, duration = 500 }) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  const rafRef = React.useRef(null);
  React.useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = from + (to - from) * eased;
      setDisplay(cur);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else { fromRef.current = to; setDisplay(to); }
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);
  return <>{format(display)}</>;
}

// Stat chip
function StatChip({ label, value, color = DW.cyan, icon, glow = false }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      padding: '6px 10px',
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${color}44`,
      borderRadius: 4,
      minWidth: 60,
      boxShadow: glow ? `0 0 18px ${color}88, inset 0 0 10px ${color}33` : 'none',
    }}>
      <div style={{
        fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em',
        color: 'rgba(255,255,255,0.5)', fontFamily: DW.mono,
      }}>{label}</div>
      <div style={{
        fontFamily: DW.display, fontSize: 14, fontWeight: 800, color: '#fff',
        textShadow: `0 0 10px ${color}`,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
        <span>{value}</span>
      </div>
    </div>
  );
}

// Top HUD bar (always visible across game screens)
function HUDBar({ state }) {
  const load = getLoad(state.inventory);
  return (
    <div style={{
      position: 'absolute', top: 56, left: 0, right: 0, zIndex: 20,
      padding: '6px 12px',
      display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between',
      background: 'linear-gradient(180deg, rgba(10,1,24,0.88), rgba(10,1,24,0.6) 80%, transparent)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <StatChip label="Day" value={`${state.day}/${DW_CONFIG.totalDays}`} color={DW.cyan} />
        <StatChip label="Cash" value={<AnimatedNum value={state.cash} />} color={DW.lime} glow />
        <StatChip label="Debt" value={fmt(state.debt)} color={DW.danger} />
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <StatChip label="Load" value={`${load}/${state.trenchCapacity || DW_CONFIG.baseCapacity}`} color={load > 80 ? DW.danger : DW.magenta} />
        {state.heat > 0 && <StatChip label="Heat" value={state.heat} color={DW.gold} />}
      </div>
    </div>
  );
}

// Bottom nav tabs (Market / Inventory / Travel / Phone)
function BottomNav({ screen, onNavigate, messagesUnread }) {
  const tabs = [
    { id: 'market', label: 'Market', icon: '💵', color: DW.lime },
    { id: 'inventory', label: 'Stash', icon: '🧥', color: DW.magenta },
    { id: 'travel', label: 'Travel', icon: '✈️', color: DW.cyan },
    { id: 'phone', label: 'Phone', icon: '📱', color: DW.sunset, badge: messagesUnread },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
      padding: '10px 12px 28px',
      background: 'linear-gradient(0deg, rgba(10,1,24,0.96), rgba(10,1,24,0.75) 60%, transparent)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', gap: 6,
    }}>
      {tabs.map(t => {
        const active = screen === t.id;
        return (
          <button
            key={t.id}
            onClick={() => { DWAudio.tap(); onNavigate(t.id); }}
            style={{
              flex: 1, background: active ? `${t.color}22` : 'transparent',
              border: `1px solid ${active ? t.color : 'rgba(255,255,255,0.08)'}`,
              color: '#fff', padding: '8px 4px',
              borderRadius: 4, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              fontFamily: DW.display, fontWeight: 700, letterSpacing: '0.08em',
              fontSize: 10, textTransform: 'uppercase',
              boxShadow: active ? `0 0 20px ${t.color}66, inset 0 0 10px ${t.color}33` : 'none',
              textShadow: active ? `0 0 10px ${t.color}` : 'none',
              position: 'relative',
              transition: 'all 180ms',
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span>{t.label}</span>
            {t.badge > 0 && (
              <div style={{
                position: 'absolute', top: 4, right: 8,
                width: 14, height: 14, borderRadius: '50%',
                background: DW.danger, fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 8px ${DW.danger}`,
              }}>{t.badge}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Spark line (price history mini-chart)
function Spark({ values, color, width = 40, height = 16 }) {
  if (!values || values.length < 2) {
    return <div style={{ width, height, opacity: 0.3, fontFamily: DW.mono, fontSize: 9, color }}>—</div>;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const up = last >= prev;
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" opacity="0.85" />
      <circle cx={width} cy={height - ((last - min) / range) * height} r="1.8"
              fill={up ? DW.good : DW.danger}
              style={{ filter: `drop-shadow(0 0 4px ${up ? DW.good : DW.danger})` }}/>
    </svg>
  );
}

// Full-screen modal sheet (slides up)
function Sheet({ open, onClose, children, title, color = DW.magenta }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 40,
      pointerEvents: open ? 'auto' : 'none',
    }}>
      <div
        onClick={() => { DWAudio.cancel(); onClose(); }}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(10,1,24,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0, transition: 'opacity 260ms',
        }}
      />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(180deg, #1b0a3e 0%, #0a0118 100%)',
        border: `1px solid ${color}44`, borderBottom: 'none',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '18px 20px 30px',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 320ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 -10px 40px ${color}55`,
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.3)',
          margin: '0 auto 14px',
        }}/>
        {title && (
          <div style={{
            fontFamily: DW.display, fontWeight: 800, fontSize: 20,
            color: '#fff', textShadow: `0 0 14px ${color}`,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 14,
          }}>{title}</div>
        )}
        {children}
      </div>
    </div>
  );
}

// Status bar (spoof iOS top)
function StatusBar({ time = '22:48' }) {
  return (
    <div style={{
      position: 'absolute', top: 12, left: 0, right: 0, zIndex: 30,
      padding: '4px 32px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: DW.display, color: '#fff', fontWeight: 700, fontSize: 14,
      textShadow: '0 0 6px rgba(0,0,0,0.5)',
    }}>
      <span>{time}</span>
      <span style={{ fontFamily: DW.mono, fontSize: 11, letterSpacing: '0.1em' }}>CRIME·NET 5G</span>
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 11 }}>97%</span>
        <span>🔋</span>
      </span>
    </div>
  );
}

// Toast (transient flash message)
function Toast({ msg, color = DW.magenta, onDone }) {
  React.useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => onDone && onDone(), 2200);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return (
    <div style={{
      position: 'absolute', top: 110, left: '50%', transform: 'translateX(-50%)',
      zIndex: 50,
      background: 'rgba(10,1,24,0.95)', border: `1px solid ${color}`,
      color: '#fff', padding: '8px 18px',
      fontFamily: DW.display, fontWeight: 700, fontSize: 12,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      borderRadius: 2, boxShadow: `0 0 22px ${color}cc`,
      textShadow: `0 0 8px ${color}`,
      animation: 'dw-toast 2.2s ease-out forwards',
    }}>{msg}</div>
  );
}

// Keyframe CSS (injected once)
function UIStyles() {
  return (
    <style>{`
      @keyframes dw-toast {
        0% { opacity: 0; transform: translate(-50%, -10px); }
        15% { opacity: 1; transform: translate(-50%, 0); }
        85% { opacity: 1; }
        100% { opacity: 0; transform: translate(-50%, -10px); }
      }
      @keyframes dw-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes dw-shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-2px); }
        40% { transform: translateX(2px); }
        60% { transform: translateX(-1px); }
        80% { transform: translateX(1px); }
      }
      @keyframes dw-glow {
        0%, 100% { box-shadow: 0 0 12px currentColor; }
        50% { box-shadow: 0 0 28px currentColor, 0 0 48px currentColor; }
      }
      @keyframes dw-scan {
        from { background-position: 0 0; }
        to { background-position: 0 6px; }
      }
      @keyframes dw-fadeup {
        from { opacity: 0; transform: translateY(18px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes dw-marquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .dw-scanlines {
        position: relative;
      }
      .dw-scanlines::after {
        content: ''; position: absolute; inset: 0; pointer-events: none;
        background: repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 3px);
      }
    `}</style>
  );
}

Object.assign(window, {
  NeonBtn, Stepper, BigSlider, AnimatedNum, StatChip, HUDBar, BottomNav,
  Spark, Sheet, StatusBar, Toast, UIStyles,
});
