// ═══════════════════════════════════════════════════════════
// proto-app.jsx — router, iPhone frame shell, Tweaks panel
// ═══════════════════════════════════════════════════════════

const TWEAKS = /*EDITMODE-BEGIN*/{
  "marketLayout": "list",
  "mapVariant": "stylized",
  "showInIphoneFrame": true,
  "muted": false
}/*EDITMODE-END*/;

function ProtoApp() {
  const [state, dispatch] = React.useReducer(storeReducer, null, makeInitialState);
  const [trade, setTrade] = React.useState(null);   // { drugId }
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const [tweaks, setTweaks] = React.useState(TWEAKS);
  const [editAvailable, setEditAvailable] = React.useState(false);
  const [toast, setToast] = React.useState(null);

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

  // Ambient audio autoplay deferred until first interaction happens via buttons

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
      case 'gameover':
        return <GameOverScreen state={state} dispatch={dispatch}/>;
      default:
        return <IntroScreen onStart={() => dispatch({ type: 'START_GAME' })}/>;
    }
  })();

  // Show bottom nav on gameplay screens
  const showNav = ['market', 'inventory', 'travel', 'phone'].includes(state.screen);
  const showStatus = state.screen !== 'event' && state.screen !== 'intro' && state.screen !== 'gameover' && state.screen !== 'endOfDay';

  const phoneContent = (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
      <UIStyles/>
      {showStatus && <StatusBar/>}
      {screenContent}
      {showNav && <BottomNav screen={state.screen} onNavigate={navigate} messagesUnread={msgsUnread}/>}
      <TradeSheet state={state} tradeCtx={trade} dispatch={dispatch} onClose={closeTrade}/>
      <Toast msg={toast} onDone={() => setToast(null)}/>

      {/* Reset floating button (always available for testing) */}
      {state.screen !== 'intro' && (
        <button
          onClick={() => {
            if (confirm('Reset the game?')) {
              DWAudio.stopAmbient();
              dispatch({ type: 'RESET' });
            }
          }}
          style={{
            position: 'absolute', top: 20, left: 6, zIndex: 100,
            background: 'rgba(10,1,24,0.6)', border: `1px solid ${DW.danger}55`,
            color: '#fff', width: 22, height: 22, borderRadius: '50%',
            fontSize: 11, cursor: 'pointer', padding: 0,
            fontFamily: DW.mono,
          }}
          title="Reset game"
        >⟲</button>
      )}

      {/* Mute toggle */}
      <button
        onClick={() => updateTweak('muted', !tweaks.muted)}
        style={{
          position: 'absolute', top: 20, right: 6, zIndex: 100,
          background: 'rgba(10,1,24,0.6)', border: `1px solid ${DW.cyan}55`,
          color: '#fff', width: 22, height: 22, borderRadius: '50%',
          fontSize: 11, cursor: 'pointer', padding: 0,
        }}
        title={tweaks.muted ? 'Unmute' : 'Mute'}
      >{tweaks.muted ? '🔇' : '🔊'}</button>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: `radial-gradient(ellipse at 30% 20%, #2a0d4e 0%, #0a0118 60%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <PhoneFrame inFrame={tweaks.showInIphoneFrame}>{phoneContent}</PhoneFrame>

      {tweaksOpen && (
        <TweaksPanel tweaks={tweaks} onChange={updateTweak} onClose={() => setTweaksOpen(false)}/>
      )}

      {/* Side panel hint */}
      <div style={{
        position: 'fixed', top: 14, left: 14, zIndex: 200,
        fontFamily: DW.mono, fontSize: 10, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>
        DOPE WARS ⋅ PROTO v0.1
      </div>
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
        label="iPhone frame"
        value={tweaks.showInIphoneFrame}
        onChange={v => onChange('showInIphoneFrame', v)}
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

function PhoneFrame({ inFrame, children }) {
  const ref = React.useRef(null);
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const pad = 40;
      const fw = inFrame ? 420 : 402;
      const fh = inFrame ? 892 : 874;
      setScale(Math.min(1, Math.min((w - pad) / fw, (h - pad) / fh)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [inFrame]);

  if (inFrame) {
    return (
      <div ref={ref} style={{
        width: 420, height: 892, borderRadius: 54,
        background: '#000',
        padding: 9,
        boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 0 2px #222, 0 0 60px rgba(255,46,166,0.25)',
        transform: `scale(${scale})`, transformOrigin: 'center center',
        position: 'relative',
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: 46, overflow: 'hidden',
          background: '#000', position: 'relative',
        }}>
          {children}
          {/* dynamic island */}
          <div style={{
            position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
            width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 70,
            border: '1px solid rgba(255,255,255,0.05)',
          }} />
          {/* home indicator */}
          <div style={{
            position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
            width: 139, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.4)',
            zIndex: 80, pointerEvents: 'none',
          }}/>
        </div>
      </div>
    );
  }
  return (
    <div ref={ref} style={{
      width: 402, height: 874, position: 'relative',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 20, overflow: 'hidden', background: '#000',
      boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(255,46,166,0.2)',
      transform: `scale(${scale})`, transformOrigin: 'center center',
    }}>
      {children}
    </div>
  );
}
Object.assign(window, { PhoneFrame });

// Mount
const root = ReactDOM.createRoot(document.getElementById('proto-root'));
root.render(<ProtoApp/>);
