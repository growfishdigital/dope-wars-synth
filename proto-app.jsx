// ═══════════════════════════════════════════════════════════
// proto-app.jsx — router, responsive shell, Tweaks panel
// ═══════════════════════════════════════════════════════════

const TWEAKS = /*EDITMODE-BEGIN*/{
  "marketLayout": "list",
  "mapVariant": "stylized",
  "muted": false
}/*EDITMODE-END*/;

function ProtoApp() {
  const [state, dispatch] = React.useReducer(storeReducer, null, makeInitialState);
  const [trade, setTrade] = React.useState(null);   // { drugId }
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const [tweaks, setTweaks] = React.useState(TWEAKS);
  const [editAvailable, setEditAvailable] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [vw, setVw] = React.useState(() => window.innerWidth);

  React.useEffect(() => {
    const fn = () => setVw(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const isDesktop = vw >= 1024;

  // Persist state
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('dw-proto-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.screen) {
          dispatch({ type: '__LOAD', state: parsed });
        }
      }
    } catch (e) {}
  }, []);
  React.useEffect(() => {
    try {
      localStorage.setItem('dw-proto-state', JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  // Tweak-mode protocol
  React.useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
    setEditAvailable(true);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Sync mute
  React.useEffect(() => {
    DWAudio.setMuted(!!tweaks.muted);
  }, [tweaks.muted]);

  const updateTweak = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*'); } catch (e) {}
  };

  // Notify user when messages arrive
  const msgsUnread = state.messages.filter(m => !m.read).length;
  const prevUnreadRef = React.useRef(msgsUnread);
  React.useEffect(() => {
    if (msgsUnread > prevUnreadRef.current) {
      DWAudio.buzz();
      setToast('📱 New message');
    }
    prevUnreadRef.current = msgsUnread;
  }, [msgsUnread]);

  const openTrade = (drugId) => setTrade({ drugId });
  const closeTrade = () => setTrade(null);

  const navigate = (screen) => { setTrade(null); dispatch({ type: 'GOTO', screen }); };

  // Screen router
  const screenContent = (() => {
    switch (state.screen) {
      case 'intro':
        return <IntroScreen onStart={() => dispatch({ type: 'START_GAME' })}/>;
      case 'market':
        return <MarketScreen state={state} dispatch={dispatch} onOpenTrade={openTrade} layout={tweaks.marketLayout}/>;
      case 'inventory':
        return <InventoryScreen state={state} dispatch={dispatch} onOpenTrade={openTrade}/>;
      case 'travel':
        return <TravelScreen state={state} dispatch={dispatch} mapVariant={tweaks.mapVariant}/>;
      case 'event':
        return <EventScreen state={state} dispatch={dispatch}/>;
      case 'phone':
        return <PhoneScreen state={state} dispatch={dispatch}/>;
      case 'endOfDay':
        return <EndOfDayScreen state={state} dispatch={dispatch}/>;
      case 'granny':
        return <GrannyScreen state={state} dispatch={dispatch}/>;
      case 'stripped':
        return <StrippedScreen state={state} dispatch={dispatch}/>;
      case 'gameover':
        return <GameOverScreen state={state} dispatch={dispatch}/>;
      default:
        return <IntroScreen onStart={() => dispatch({ type: 'START_GAME' })}/>;
    }
  })();

  // Show bottom nav on gameplay screens
  const showNav = ['market', 'inventory', 'travel', 'phone'].includes(state.screen);
  const showStatus = !['event', 'intro', 'gameover', 'endOfDay', 'granny', 'stripped'].includes(state.screen);

  const gameContent = (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
      <UIStyles/>
      <MusicPlayer muted={tweaks.muted} onMuteToggle={() => updateTweak('muted', !tweaks.muted)} gameStarted={state.screen !== 'intro'}/>
      {screenContent}
      {showNav && <BottomNav screen={state.screen} onNavigate={navigate} messagesUnread={msgsUnread}/>}
      <TradeSheet state={state} tradeCtx={trade} dispatch={dispatch} onClose={closeTrade}/>
      <Toast msg={toast} onDone={() => setToast(null)}/>

      {/* Reset floating button */}
      {state.screen !== 'intro' && (
        <button
          onClick={() => {
            if (confirm('Reset the game?')) {
              DWAudio.stopAmbient();
              dispatch({ type: 'RESET' });
            }
          }}
          style={{
            position: 'absolute', top: 58, left: 6, zIndex: 100,
            background: 'rgba(10,1,24,0.6)', border: `1px solid ${DW.danger}55`,
            color: '#fff', width: 22, height: 22, borderRadius: '50%',
            fontSize: 11, cursor: 'pointer', padding: 0,
            fontFamily: DW.mono,
          }}
          title="Reset game"
        >⟲</button>
      )}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: `radial-gradient(ellipse at 30% 20%, #2a0d4e 0%, #0a0118 60%)`,
      display: isDesktop ? 'flex' : 'block',
      alignItems: isDesktop ? 'center' : undefined,
      justifyContent: isDesktop ? 'center' : undefined,
      overflow: 'hidden',
    }}>
      <ResponsiveShell vw={vw}>{gameContent}</ResponsiveShell>

      {tweaksOpen && (
        <TweaksPanel tweaks={tweaks} onChange={updateTweak} onClose={() => setTweaksOpen(false)}/>
      )}

      {isDesktop && (
        <div style={{
          position: 'fixed', top: 14, left: 14, zIndex: 200,
          fontFamily: DW.mono, fontSize: 10, color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>
          DOPE WARS: VICE
        </div>
      )}
    </div>
  );
}

function TweaksPanel({ tweaks, onChange, onClose }) {
  return (
    <div style={{
      position: 'fixed', top: 14, right: 14, zIndex: 300,
      width: 260, background: 'rgba(10,1,24,0.95)',
      border: `1px solid ${DW.magenta}`, borderRadius: 6,
      padding: 14, color: '#fff', fontFamily: DW.body,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      boxShadow: `0 0 40px ${DW.magenta}55`,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12, paddingBottom: 8,
        borderBottom: `1px solid ${DW.magenta}44`,
      }}>
        <div style={{
          fontFamily: DW.display, fontWeight: 800, fontSize: 14,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          textShadow: `0 0 10px ${DW.magenta}`,
        }}>Tweaks</div>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none', color: '#fff',
          fontSize: 16, cursor: 'pointer',
        }}>×</button>
      </div>

      <TweakSelect
        label="Market layout"
        value={tweaks.marketLayout}
        options={[
          { val: 'list', label: 'List' },
          { val: 'grid', label: 'Grid' },
          { val: 'ticker', label: 'Ticker' },
        ]}
        onChange={v => onChange('marketLayout', v)}
      />
      <TweakSelect
        label="Map variant"
        value={tweaks.mapVariant}
        options={[
          { val: 'stylized', label: 'Stylized cards' },
          { val: 'grid', label: 'Data list' },
          { val: 'routes', label: 'Route map' },
        ]}
        onChange={v => onChange('mapVariant', v)}
      />
      <TweakToggle
        label="Audio"
        value={!tweaks.muted}
        onChange={v => onChange('muted', !v)}
      />
    </div>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontFamily: DW.mono, fontSize: 9, letterSpacing: '0.14em',
        color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
        marginBottom: 5,
      }}>{label}</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {options.map(o => (
          <button
            key={o.val}
            onClick={() => onChange(o.val)}
            style={{
              flex: 1, padding: '7px 4px',
              background: value === o.val ? `${DW.magenta}33` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${value === o.val ? DW.magenta : 'rgba(255,255,255,0.1)'}`,
              color: '#fff', fontFamily: DW.display, fontWeight: 700,
              fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
              borderRadius: 2, cursor: 'pointer',
              boxShadow: value === o.val ? `0 0 12px ${DW.magenta}66` : 'none',
            }}
          >{o.label}</button>
        ))}
      </div>
    </div>
  );
}
function TweakToggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 12 }}>
      <div style={{
        fontFamily: DW.mono, fontSize: 10, letterSpacing: '0.12em',
        color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase',
      }}>{label}</div>
      <button onClick={() => onChange(!value)}
        style={{
          width: 40, height: 22, borderRadius: 11, padding: 2,
          background: value ? DW.magenta : 'rgba(255,255,255,0.12)',
          border: `1px solid ${value ? DW.magenta : 'rgba(255,255,255,0.2)'}`,
          cursor: 'pointer', transition: 'all 200ms',
          boxShadow: value ? `0 0 10px ${DW.magenta}88` : 'none',
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff',
          transform: value ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform 200ms',
        }}/>
      </button>
    </div>
  );
}

Object.assign(window, { ProtoApp });

// Responsive shell — no phone frame, adapts to viewport
function ResponsiveShell({ vw, children }) {
  // Mobile: full screen
  if (vw < 640) {
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
        {children}
      </div>
    );
  }
  // Tablet: full screen
  if (vw < 1024) {
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
        {children}
      </div>
    );
  }
  // Desktop: centered card with background visible on sides
  const cardW = Math.min(820, vw - 80);
  const cardH = Math.min(window.innerHeight - 48, 960);
  return (
    <div style={{
      width: cardW, height: cardH,
      position: 'relative', overflow: 'hidden',
      background: '#000',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: `0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(255,46,166,0.18), inset 0 1px 0 rgba(255,255,255,0.06)`,
    }}>
      {children}
    </div>
  );
}
Object.assign(window, { ResponsiveShell });

// Error boundary — catches render errors and shows a debug message instead of blank screen
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#0a0118',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            fontFamily: 'monospace', color: '#ff3366', maxWidth: 600,
            background: 'rgba(255,51,102,0.1)', border: '1px solid #ff3366',
            borderRadius: 8, padding: 24,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              💥 Runtime Error
            </div>
            <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', color: '#fff', opacity: 0.85 }}>
              {String(this.state.error)}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('proto-root'));
root.render(<ErrorBoundary><ProtoApp/></ErrorBoundary>);
